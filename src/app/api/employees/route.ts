import { NextRequest } from "next/server";
import { z } from "zod";
import { authService } from "@/server/services/auth.service";
import { employeeRepository } from "@/server/repositories/employee.repository";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";
import { passwordComplexitySchema } from "@/features/auth/schemas/auth.schema";

const createEmployeeSchema = z.object({
  employeeId: z.string().trim().min(3, "Employee ID must be at least 3 characters").max(20),
  name: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Please provide a valid work email"),
  role: z.enum(["DOCTOR", "RECEPTIONIST", "ADMIN"]),
  department: z.string().trim().min(2, "Department is required"),
  password: passwordComplexitySchema,
  phone: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const employees = await employeeRepository.listAll();
    return sendSuccess(employees);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireRole(["SUPER_ADMIN", "ADMIN"]);

    const body = await req.json();
    const validated = createEmployeeSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await authService.createEmployee(validated, identity.id, {
      ip,
      userAgent,
    });

    return sendSuccess(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
