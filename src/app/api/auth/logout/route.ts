import { NextRequest } from "next/server";
import { sessionService } from "@/server/auth/session";
import { COOKIE_NAME } from "@/lib/constants";
import { sendSuccess } from "@/server/errors/error-handler";

export async function POST(req: NextRequest) {
  const response = sendSuccess({
    message: "Logged out successfully.",
  });

  // Expire cookie immediately
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
