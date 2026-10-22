import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Appointment } from "@/models/Appointment";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";
import { Notification } from "@/models/Notification";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const bookAppointmentSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().trim().min(2, "Patient Name is required"),
  patientPhone: z.string().trim().optional(),
  patientEmail: z.string().trim().email().optional(),
  doctorId: z.string().min(1, "Doctor is required"),
  departmentId: z.string().min(1, "Department is required"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: z.string().min(1, "Time slot is required"),
  type: z.enum(["IN_PERSON", "FOLLOW_UP", "EMERGENCY"]).default("IN_PERSON"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    // If patient is querying, strictly restrict to their own records
    if (identity.role === "PATIENT") {
      query.patientId = identity.id;
    } else if (doctorId) {
      query.doctorId = doctorId;
    }

    if (date) {
      query.appointmentDate = date;
    } else if (startDate && endDate) {
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.appointmentDate = { $gte: startDate };
    } else if (endDate) {
      query.appointmentDate = { $lte: endDate };
    }

    if (status) query.status = status;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { patientName: regex },
        { appointmentId: regex },
        { doctorName: regex },
        { departmentName: regex },
      ];
    }

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1, timeSlot: 1 }).exec();
    return sendSuccess(appointments);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = bookAppointmentSchema.parse(body);

    const doc = await Doctor.findById(validated.doctorId);
    const dept = await Department.findById(validated.departmentId);

    const randomSuffix = crypto.randomInt(1000, 9999);
    const appointmentId = `APT-${new Date().getFullYear()}-${randomSuffix}`;

    // Resolve patient ID: explicit patientId, or logged-in patient, or staff placeholder
    const effectivePatientId =
      validated.patientId || (identity.role === "PATIENT" ? identity.id : identity.id);

    // Patients raise appointment with PENDING status! Staff can directly confirm.
    const initialStatus = identity.role === "PATIENT" ? "PENDING" : "CONFIRMED";

    const appointment = new Appointment({
      appointmentId,
      patientId: effectivePatientId,
      patientName: validated.patientName,
      patientPhone: validated.patientPhone,
      patientEmail: validated.patientEmail || (identity.role === "PATIENT" ? identity.email : undefined),
      doctorId: validated.doctorId,
      doctorName: doc?.name || "Specialist Doctor",
      departmentId: validated.departmentId,
      departmentName: dept?.name || "General OPD",
      appointmentDate: validated.appointmentDate,
      timeSlot: validated.timeSlot,
      type: validated.type,
      status: initialStatus,
      notes: validated.notes,
    });

    await appointment.save();

    // Create notification
    if (initialStatus === "PENDING") {
      await Notification.create({
        recipientEmail: validated.patientEmail || identity.email,
        recipientType: "PATIENT",
        title: "Appointment Request Submitted",
        message: `Your appointment request with ${doc?.name || "the specialist"} for ${validated.appointmentDate} at ${validated.timeSlot} has been submitted (ID: ${appointmentId}). Awaiting hospital confirmation.`,
        type: "APPOINTMENT",
      });
    } else {
      await Notification.create({
        recipientEmail: validated.patientEmail || identity.email,
        recipientType: "PATIENT",
        title: "Appointment Confirmed",
        message: `Your consultation with ${doc?.name || "the specialist"} is confirmed for ${validated.appointmentDate} at ${validated.timeSlot}. ID: ${appointmentId}`,
        type: "APPOINTMENT",
      });
    }

    return sendSuccess(appointment, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
