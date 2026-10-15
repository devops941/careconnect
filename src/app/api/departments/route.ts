import { NextRequest } from "next/server";
import { z } from "zod";
import { Department } from "@/models/Department";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const departmentSchema = z.object({
  deptId: z.string().trim().min(2, "Department Code is required").max(10),
  name: z.string().trim().min(2, "Department Name is required").max(100),
  description: z.string().optional(),
  headDoctorName: z.string().optional(),
  opdRoomNo: z.string().default("Room 101"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET() {
  try {
    await connectToDatabase();
    const departments = await Department.find().sort({ name: 1 }).exec();
    return sendSuccess(departments);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await connectToDatabase();

    const body = await req.json();
    const validated = departmentSchema.parse(body);

    const dept = new Department({
      ...validated,
      deptId: validated.deptId.toUpperCase(),
    });

    await dept.save();
    return sendSuccess(dept, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
