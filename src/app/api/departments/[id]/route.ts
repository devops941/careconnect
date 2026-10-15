import { NextRequest } from "next/server";
import { z } from "zod";
import { Department } from "@/models/Department";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const updateDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().optional(),
  headDoctorName: z.string().optional(),
  opdRoomNo: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = updateDepartmentSchema.parse(body);

    const updated = await Department.findByIdAndUpdate(
      id,
      { $set: validated },
      { returnDocument: "after" }
    ).exec();

    return sendSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
