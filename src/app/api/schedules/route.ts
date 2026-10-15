import { NextRequest } from "next/server";
import { z } from "zod";
import { DoctorSchedule } from "@/models/DoctorSchedule";
import { Doctor } from "@/models/Doctor";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const createLeaveSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  doctorName: z.string().min(1, "Doctor Name is required"),
  departmentName: z.string().optional(),
  leaveType: z.enum(["CASUAL", "MEDICAL", "CONFERENCE", "EMERGENCY"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  reason: z.string().min(3, "Reason is required"),
  replacementDoctorName: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const query: Record<string, any> = {};
    if (doctorId) query.doctorId = doctorId;

    const schedules = await DoctorSchedule.find(query)
      .sort({ startDate: -1 })
      .lean();

    return sendSuccess(schedules);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createLeaveSchema.parse(body);

    const schedule = await DoctorSchedule.create({
      ...validated,
      status: identity.role === "ADMIN" || identity.role === "SUPER_ADMIN" ? "APPROVED" : "PENDING",
    });

    // Optionally mark Doctor status ON_LEAVE
    await Doctor.findByIdAndUpdate(validated.doctorId, {
      status: "ON_LEAVE",
    });

    return sendSuccess(schedule, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const { scheduleId, status } = body;

    const schedule = await DoctorSchedule.findByIdAndUpdate(
      scheduleId,
      { status },
      { new: true }
    );

    return sendSuccess(schedule);
  } catch (err) {
    return handleApiError(err);
  }
}
