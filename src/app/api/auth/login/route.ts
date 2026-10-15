import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/server/services/auth.service";
import { sessionService } from "@/server/auth/session";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    rateLimiter.assertLimit(`login_${ip}`, 10, 60);

    const body = await req.json();
    const validated = loginSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const { token, user } = await authService.loginWithCredentials(validated, {
      ip,
      userAgent,
    });

    const response = sendSuccess({
      user,
      message: "Authentication successful.",
    });

    // Set secure HTTP-only session cookie
    const cookieOptions = sessionService.getSessionCookieOptions();
    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: validated.rememberMe ? cookieOptions.maxAge : undefined, // Session cookie if rememberMe false
      path: cookieOptions.path,
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
