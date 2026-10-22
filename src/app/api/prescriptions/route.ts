import { NextRequest } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { Prescription } from "@/models/Prescription";
import { QueueToken } from "@/models/QueueToken";
import { Appointment } from "@/models/Appointment";
import { Invoice } from "@/models/Invoice";
import { Doctor } from "@/models/Doctor";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const medicationSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().default("After meals"),
});

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient Name is required"),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  departmentName: z.string().optional(),
  appointmentId: z.string().optional(),
  tokenNumber: z.string().optional(),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  clinicalNotes: z.string().optional(),
  vitals: z
    .object({
      bp: z.string().optional(),
      pulse: z.string().optional(),
      temp: z.string().optional(),
      weight: z.string().optional(),
    })
    .optional(),
  medications: z.array(medicationSchema).default([]),
  labInvestigations: z.array(z.string()).default([]),
  followUpDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");

    const query: Record<string, any> = {};

    // Patient can only see their own prescriptions
    if (authContext.identity.role === "PATIENT") {
      query.patientId = new mongoose.Types.ObjectId(authContext.identity.id);
    } else {
      if (patientId) query.patientId = new mongoose.Types.ObjectId(patientId);
      if (doctorId) query.doctorId = new mongoose.Types.ObjectId(doctorId);
    }

    const prescriptions = await Prescription.find(query).sort({ createdAt: -1 }).limit(100).exec();
    return sendSuccess(prescriptions);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireRole(["DOCTOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const body = await req.json();
    const validated = createPrescriptionSchema.parse(body);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prescriptionId = `RX-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const doctorId = validated.doctorId || authContext.identity.id;
    const doctorName = validated.doctorName || authContext.identity.name;
    const departmentName = validated.departmentName || authContext.identity.department || "Consultant Clinic";

    const prescription = new Prescription({
      prescriptionId,
      patientId: new mongoose.Types.ObjectId(validated.patientId),
      patientName: validated.patientName,
      doctorId: new mongoose.Types.ObjectId(doctorId),
      doctorName,
      departmentName,
      appointmentId: validated.appointmentId
        ? new mongoose.Types.ObjectId(validated.appointmentId)
        : undefined,
      tokenNumber: validated.tokenNumber,
      diagnosis: validated.diagnosis,
      clinicalNotes: validated.clinicalNotes,
      vitals: validated.vitals,
      medications: validated.medications,
      labInvestigations: validated.labInvestigations,
      followUpDate: validated.followUpDate,
    });

    await prescription.save();

    // If there is an associated token or appointment, mark it completed
    if (validated.tokenNumber) {
      await QueueToken.findOneAndUpdate(
        { tokenNumber: validated.tokenNumber },
        { status: "COMPLETED", completedAt: new Date() }
      );
    }

    if (validated.appointmentId) {
      await Appointment.findByIdAndUpdate(validated.appointmentId, {
        status: "COMPLETED",
      });
    }

    // Ensure invoice exists for this completed consultation
    try {
      const matchCriteria: any[] = [];
      if (validated.appointmentId && mongoose.isValidObjectId(validated.appointmentId)) {
        matchCriteria.push({ appointmentId: new mongoose.Types.ObjectId(validated.appointmentId) });
      }
      if (validated.tokenNumber) {
        matchCriteria.push({ queueTokenNumber: validated.tokenNumber });
      }

      const existingInvoice = matchCriteria.length > 0 ? await Invoice.findOne({ $or: matchCriteria }).exec() : null;

      if (!existingInvoice) {
        // Fetch doctor consultation fee
        let fee = 500;
        if (doctorId && mongoose.isValidObjectId(doctorId)) {
          const doc = await Doctor.findById(doctorId).lean().exec();
          if (doc?.consultationFee) fee = doc.consultationFee;
        }

        const count = await Invoice.countDocuments();
        const year = new Date().getFullYear();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}-${randomSuffix}`;

        const items: any[] = [
          {
            description: `OPD Consultation & Prescription - ${doctorName} (${departmentName})`,
            category: "CONSULTATION",
            unitPrice: fee,
            quantity: 1,
            total: fee,
          },
          {
            description: "Hospital OPD Clinical Charting & Queue Processing",
            category: "REGISTRATION",
            unitPrice: 100,
            quantity: 1,
            total: 100,
          },
        ];

        // Add any lab investigations ordered by doctor
        if (validated.labInvestigations && validated.labInvestigations.length > 0) {
          validated.labInvestigations.forEach((lab) => {
            items.push({
              description: `Diagnostic Investigation: ${lab}`,
              category: "LAB",
              unitPrice: 250,
              quantity: 1,
              total: 250,
            });
          });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

        await Invoice.create({
          invoiceNumber,
          patientId: validated.patientId,
          patientName: validated.patientName,
          doctorId: mongoose.isValidObjectId(doctorId) ? new mongoose.Types.ObjectId(doctorId) : undefined,
          doctorName,
          departmentName,
          appointmentId: validated.appointmentId && mongoose.isValidObjectId(validated.appointmentId)
            ? new mongoose.Types.ObjectId(validated.appointmentId)
            : undefined,
          queueTokenNumber: validated.tokenNumber,
          items,
          subtotal: totalAmount,
          discount: 0,
          tax: 0,
          totalAmount,
          paidAmount: 0,
          balanceDue: totalAmount,
          paymentStatus: "PENDING",
          paymentMethod: "UNPAID",
          cashierName: "Front Desk Cashier",
          issuedAt: new Date(),
        });
      }
    } catch (invErr) {
      console.error("Auto-invoice generation error on prescription save:", invErr);
    }

    return sendSuccess(prescription, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
