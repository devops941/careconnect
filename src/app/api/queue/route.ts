import { NextRequest } from "next/server";
import { z } from "zod";
import { QueueToken } from "@/models/QueueToken";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";
import { Appointment } from "@/models/Appointment";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const generateTokenSchema = z.object({
  patientName: z.string().trim().min(2, "Patient Name is required"),
  patientPhone: z.string().optional(),
  patientId: z.string().optional(),
  doctorId: z.string().min(1, "Doctor is required"),
  departmentId: z.string().min(1, "Department is required"),
  appointmentId: z.string().optional(),
  priority: z.enum(["NORMAL", "EMERGENCY"]).default("NORMAL"),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const today = new Date().toISOString().split("T")[0];
    const date = searchParams.get("date") || today;
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    const query: Record<string, any> = { tokenDate: date };
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;

    const tokens = await QueueToken.find(query).sort({ priority: -1, tokenSequence: 1 }).exec();
    return sendSuccess(tokens);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = generateTokenSchema.parse(body);

    const today = new Date().toISOString().split("T")[0];

    // Determine next sequence for today
    const latestToken = await QueueToken.findOne({ tokenDate: today })
      .sort({ tokenSequence: -1 })
      .exec();

    const nextSeq = latestToken ? latestToken.tokenSequence + 1 : 101;
    const prefix = validated.priority === "EMERGENCY" ? "EMG" : "A";
    const tokenNumber = `${prefix}-${nextSeq}`;

    const doc = await Doctor.findById(validated.doctorId);
    const dept = await Department.findById(validated.departmentId);

    const token = new QueueToken({
      tokenNumber,
      tokenSequence: nextSeq,
      tokenDate: today,
      patientName: validated.patientName,
      patientPhone: validated.patientPhone,
      patientId: validated.patientId,
      doctorId: validated.doctorId,
      doctorName: doc?.name || "Attending Physician",
      departmentId: validated.departmentId,
      departmentName: dept?.name || "General Medicine",
      appointmentId: validated.appointmentId,
      opdRoomNo: doc?.opdRoomNo || dept?.opdRoomNo || "Room 101",
      priority: validated.priority,
      status: "WAITING",
    });

    await token.save();

    // If linked to an appointment, mark appointment as CHECKED_IN
    if (validated.appointmentId) {
      await Appointment.findByIdAndUpdate(validated.appointmentId, {
        status: "CHECKED_IN",
        tokenNumber,
      });
    }

    return sendSuccess(token, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
