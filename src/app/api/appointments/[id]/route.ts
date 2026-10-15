import { NextRequest } from "next/server";
import { z } from "zod";
import { Appointment } from "@/models/Appointment";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const updateAppointmentSchema = z.object({
  status: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  appointmentDate: z.string().optional(),
  timeSlot: z.string().optional(),
  cancellationReason: z.string().optional(),
  tokenNumber: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = updateAppointmentSchema.parse(body);

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { $set: validated },
      { returnDocument: "after" }
    ).exec();

    return sendSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
