import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/server/services/auth.service";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    rateLimiter.assertLimit(`reset_password_${ip}`, 5, 60);

    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const result = await authService.resetPassword(validated.token, validated.password, {
      ip,
      userAgent,
    });

    return sendSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
