import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/server/database/mongodb";

export async function GET() {
  let dbStatus = "disconnected";
  try {
    await connectToDatabase();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    service: "careconnect-auth-module",
    version: "1.0.0",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
