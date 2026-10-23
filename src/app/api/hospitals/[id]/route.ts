import { NextRequest } from "next/server";
import { z } from "zod";
import { hospitalRepository } from "@/server/repositories/hospital.repository";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const updateHospitalSchema = z.object({
  name: z.string().trim().min(2).optional(),
  code: z.string().trim().min(2).optional(),
  tagline: z.string().optional(),
  contactEmail: z.string().trim().email().optional(),
  phone: z.string().optional(),
  emergencyPhone: z.string().optional(),
  licenseNumber: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  departments: z.array(z.string()).optional(),
  emergency24x7: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  isMainBranch: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospital = await hospitalRepository.getHospitalById(id);
    if (!hospital) {
      return handleApiError(new Error("Hospital not found"));
    }
    return sendSuccess(hospital);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const validated = updateHospitalSchema.parse(body);

    const updated = await hospitalRepository.updateHospital(id, validated);
    if (!updated) {
      return handleApiError(new Error("Hospital not found"));
    }
    return sendSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;
    const success = await hospitalRepository.deleteHospital(id);
    if (!success) {
      return handleApiError(new Error("Failed to delete hospital"));
    }
    return sendSuccess({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
