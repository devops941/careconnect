import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/server/services/auth.service";
import { rateLimiter } from "@/server/middleware/rate-limit";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    rateLimiter.assertLimit(`register_${ip}`, 5, 60);

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;
    const user = await authService.register(
      {
        name: validated.name,
        email: validated.email,
        password: validated.password,
      },
      { ip, userAgent }
    );

    return sendSuccess(
      {
        user,
        message: "Registration successful. Please verify your email to access all hospital services.",
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
