import { NextRequest } from "next/server";
import { verifyEmailSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/server/services/auth.service";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    rateLimiter.assertLimit(`verify_email_${ip}`, 10, 60);

    const body = await req.json();
    const validated = verifyEmailSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const result = await authService.verifyEmail(validated.token, { ip, userAgent });

    return sendSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
