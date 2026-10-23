import { NextRequest } from "next/server";
import { z } from "zod";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const updateDoctorSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  consultationFee: z.coerce.number().optional(),
  opdRoomNo: z.string().optional(),
  hospitalId: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  shiftHours: z
    .object({
      morningSlot: z.string().optional(),
      eveningSlot: z.string().optional(),
    })
    .optional(),
  timeSlots: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = updateDoctorSchema.parse(body);

    const updatePayload: Record<string, any> = { ...validated };

    if (validated.hospitalId) {
      const hosp = await Hospital.findById(validated.hospitalId);
      if (hosp) {
        updatePayload.hospitalName = hosp.name;
      }
    }

    const updated = await Doctor.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { returnDocument: "after" }
    ).exec();

    return sendSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
