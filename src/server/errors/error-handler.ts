import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./app-error";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Request validation failed",
          code: "VALIDATION_ERROR",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Handle known operational AppErrors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected internal server errors
  console.error("Unhandled API Error:", error);
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "An unexpected error occurred. Please try again later.",
        code: "INTERNAL_SERVER_ERROR",
        details: isDev && error instanceof Error ? error.message : undefined,
      },
    },
    { status: 500 }
  );
}

export function sendSuccess<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, headers }
  );
}
