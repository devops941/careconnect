import { NextRequest } from "next/server";
import { z } from "zod";
import { QueueToken } from "@/models/QueueToken";
import { Appointment } from "@/models/Appointment";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const updateTokenStatusSchema = z.object({
  status: z.enum(["WAITING", "CALLED", "IN_CONSULTATION", "COMPLETED", "SKIPPED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["DOCTOR", "RECEPTIONIST", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = updateTokenStatusSchema.parse(body);

    const updateFields: Record<string, any> = { status: validated.status };

    if (validated.status === "CALLED") {
      updateFields.calledAt = new Date();
    } else if (validated.status === "COMPLETED") {
      updateFields.completedAt = new Date();
    }

    const updated = await QueueToken.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: "after" }
    ).exec();

    // If associated with appointment, synchronize appointment status
    if (updated?.appointmentId) {
      const aptStatus =
        validated.status === "COMPLETED"
          ? "COMPLETED"
          : validated.status === "IN_CONSULTATION"
          ? "IN_CONSULTATION"
          : undefined;

      if (aptStatus) {
        await Appointment.findByIdAndUpdate(updated.appointmentId, { status: aptStatus });
      }
    }

    return sendSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
