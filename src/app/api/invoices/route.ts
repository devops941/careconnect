import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import mongoose from "mongoose";
import { Invoice } from "@/models/Invoice";
import { Notification } from "@/models/Notification";
import { Appointment } from "@/models/Appointment";
import { Doctor } from "@/models/Doctor";
import { QueueToken } from "@/models/QueueToken";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description required"),
  category: z.enum(["CONSULTATION", "REGISTRATION", "LAB", "PHARMACY", "PROCEDURE", "OTHER"]).default("CONSULTATION"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(1).default(1),
  total: z.number().min(0),
});

const createInvoiceSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  patientPhone: z.string().optional(),
  patientEmail: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  departmentName: z.string().optional(),
  appointmentId: z.string().optional(),
  queueTokenNumber: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one billing item is required"),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "NET_BANKING", "UNPAID"]).default("UNPAID"),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Automatically creates pending billing records for appointments/tokens that lack invoices
 */
async function syncUnbilledAppointments() {
  try {
    const unbilledAppointments = await Appointment.find({
      status: { $in: ["CONFIRMED", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED"] },
    })
      .lean()
      .exec();

    for (const apt of unbilledAppointments) {
      const matchCriteria: any[] = [{ appointmentId: apt._id }];
      if (apt.tokenNumber) {
        matchCriteria.push({ queueTokenNumber: apt.tokenNumber });
      }

      const existing = await Invoice.findOne({ $or: matchCriteria }).exec();
      if (!existing) {
        // Fetch doctor fee if available
        let fee = 500;
        let deptName = apt.departmentName || "Clinical Consultation";
        if (apt.doctorId && mongoose.isValidObjectId(apt.doctorId)) {
          const doc = await Doctor.findById(apt.doctorId).lean().exec();
          if (doc?.consultationFee) fee = doc.consultationFee;
          if (doc?.departmentName) deptName = doc.departmentName;
        }

        const count = await Invoice.countDocuments();
        const year = new Date().getFullYear();
        const randomSuffix = crypto.randomInt(1000, 9999);
        const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}-${randomSuffix}`;

        const items = [
          {
            description: `OPD Consultation - ${apt.doctorName} (${deptName})`,
            category: "CONSULTATION" as const,
            unitPrice: fee,
            quantity: 1,
            total: fee,
          },
          {
            description: "Hospital Registration & Digital Queue Processing",
            category: "REGISTRATION" as const,
            unitPrice: 100,
            quantity: 1,
            total: 100,
          },
        ];

        const totalAmount = fee + 100;

        await Invoice.create({
          invoiceNumber,
          patientId: apt.patientId || new mongoose.Types.ObjectId(),
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          patientEmail: apt.patientEmail,
          doctorId: apt.doctorId && mongoose.isValidObjectId(apt.doctorId) ? apt.doctorId : undefined,
          doctorName: apt.doctorName,
          departmentName: deptName,
          appointmentId: apt._id,
          queueTokenNumber: apt.tokenNumber,
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
          issuedAt: apt.createdAt || new Date(),
        });
      }
    }
  } catch (err) {
    console.error("Auto-syncing unbilled appointments error:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    // Auto-sync unbilled appointments so staff and patients never see missing records
    await syncUnbilledAppointments();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    // Patient sees only their own bills
    if (identity.role === "PATIENT") {
      const patientFilters: any[] = [];
      if (mongoose.isValidObjectId(identity.id)) {
        patientFilters.push({ patientId: new mongoose.Types.ObjectId(identity.id) });
      }
      patientFilters.push({ patientId: identity.id });
      if (identity.email) {
        patientFilters.push({ patientEmail: identity.email });
      }
      if (identity.name) {
        patientFilters.push({ patientName: new RegExp(`^${identity.name.trim()}$`, "i") });
      }
      query.$or = patientFilters;
    } else {
      // Staff/Doctor/Admin queries
      if (searchParams.get("patientId")) {
        const pid = searchParams.get("patientId")!;
        query.$or = [
          ...(mongoose.isValidObjectId(pid) ? [{ patientId: new mongoose.Types.ObjectId(pid) }] : []),
          { patientId: pid },
        ];
      }
    }

    if (status && status !== "ALL") {
      query.paymentStatus = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchConditions = [
        { invoiceNumber: searchRegex },
        { patientName: searchRegex },
        { queueTokenNumber: searchRegex },
        { doctorName: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const invoices = await Invoice.find(query)
      .sort({ issuedAt: -1 })
      .limit(100)
      .exec();

    return sendSuccess(invoices);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createInvoiceSchema.parse(body);

    // Calculate totals safely
    const subtotal = validated.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = Math.max(0, subtotal - validated.discount + validated.tax);
    const paidAmount = validated.paidAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" = "PENDING";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = "PARTIALLY_PAID";
    }

    // Generate unique human-readable invoice sequence
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments();
    const randomSuffix = crypto.randomInt(1000, 9999);
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}-${randomSuffix}`;

    const effectivePatientId = mongoose.isValidObjectId(validated.patientId)
      ? new mongoose.Types.ObjectId(validated.patientId)
      : validated.patientId;

    const effectiveDoctorId = validated.doctorId && mongoose.isValidObjectId(validated.doctorId)
      ? new mongoose.Types.ObjectId(validated.doctorId)
      : undefined;

    const effectiveAppointmentId = validated.appointmentId && mongoose.isValidObjectId(validated.appointmentId)
      ? new mongoose.Types.ObjectId(validated.appointmentId)
      : undefined;

    const newInvoice = await Invoice.create({
      ...validated,
      patientId: effectivePatientId,
      doctorId: effectiveDoctorId,
      appointmentId: effectiveAppointmentId,
      invoiceNumber,
      subtotal,
      totalAmount,
      balanceDue,
      paymentStatus,
      cashierName: identity.name || "CareConnect Desk",
      issuedAt: new Date(),
      paidAt: paymentStatus === "PAID" ? new Date() : undefined,
    });

    // Notify Patient of bill generation
    await Notification.create({
      recipientEmail: validated.patientEmail || "patient@careconnect.local",
      recipientType: "PATIENT",
      type: "BILLING",
      title: paymentStatus === "PAID" ? "Payment Receipt Generated" : "New Hospital Bill Issued",
      message:
        paymentStatus === "PAID"
          ? `Receipt #${invoiceNumber} for ₹${totalAmount} has been generated. Thank you for your payment.`
          : `Bill #${invoiceNumber} for ₹${totalAmount} has been issued. Balance due: ₹${balanceDue}.`,
    });

    return sendSuccess(newInvoice, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
