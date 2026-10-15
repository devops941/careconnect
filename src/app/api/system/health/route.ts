import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { sendSuccess, handleApiError } from "@/server/errors/error-handler";
import { AuditLog } from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "CONNECTED" : "DISCONNECTED";

    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());
    const auditLogsCount = await AuditLog.countDocuments();

    return sendSuccess({
      systemStatus: "HEALTHY",
      database: {
        status: dbStatus,
        host: mongoose.connection.host || "Local Cluster",
        name: mongoose.connection.name || "careconnect",
      },
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      uptime: {
        seconds: uptimeSeconds,
        formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
      },
      security: {
        auditLogsCount,
        retentionPolicy: "90 Days Active Log Archive",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
