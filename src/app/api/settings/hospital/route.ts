import { NextRequest } from "next/server";
import { z } from "zod";
import { hospitalSettingService } from "@/server/services/hospital-setting.service";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const hospitalSettingSchema = z.object({
  hospitalName: z.string().trim().min(2, "Hospital name must be at least 2 characters").max(150),
  tagline: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email("Please enter a valid hospital email"),
  emergencyPhone: z.string().trim().min(5, "Emergency phone number is required"),
  licenseNumber: z.string().trim().min(2, "Medical license/registration number is required"),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().optional(),
      country: z.string().default("India"),
    })
    .optional(),
  departments: z.array(z.string()).default([]),
  emergency24x7: z.boolean().default(true),
});

export async function GET() {
  try {
    const settings = await hospitalSettingService.getHospitalSettings();
    return sendSuccess(settings);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only Super Admin can complete hospital onboarding or update profile
    const { identity } = await requireRole(["SUPER_ADMIN"]);

    const body = await req.json();
    const validated = hospitalSettingSchema.parse(body);

    const ip = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await hospitalSettingService.completeOnboarding(
      validated,
      identity.id,
      identity.email,
      { ip, userAgent }
    );

    return sendSuccess(result, 200);
  } catch (err) {
    return handleApiError(err);
  }
}
