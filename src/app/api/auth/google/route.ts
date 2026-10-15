import { NextRequest } from "next/server";
import { googleAuthCallbackSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/server/services/auth.service";
import { sessionService } from "@/server/auth/session";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    rateLimiter.assertLimit(`google_auth_${ip}`, 10, 60);

    const body = await req.json();
    const validated = googleAuthCallbackSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const { token, user } = await authService.loginWithGoogle(validated.credential, {
      ip,
      userAgent,
    });

    const response = sendSuccess({
      user,
      message: "Google authentication successful.",
    });

    const cookieOptions = sessionService.getSessionCookieOptions();
    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
