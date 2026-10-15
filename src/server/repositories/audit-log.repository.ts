import mongoose from "mongoose";
import { AuditLog, IAuditLog } from "@/models/AuditLog";
import { connectToDatabase } from "../database/mongodb";
import { AuditEventType, IdentityType } from "@/lib/constants";

export interface LogAuditParams {
  actorId?: mongoose.Types.ObjectId | string;
  actorType?: IdentityType;
  actorEmail?: string;
  eventType: AuditEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export class AuditLogRepository {
  async log(params: LogAuditParams): Promise<IAuditLog> {
    try {
      await connectToDatabase();
      const sanitizedMeta = { ...params.metadata };
      // Explicitly delete sensitive keys if accidentally passed
      delete sanitizedMeta.password;
      delete sanitizedMeta.token;
      delete sanitizedMeta.passwordHash;
      delete sanitizedMeta.secret;

      const entry = new AuditLog({
        actorId: params.actorId ? new mongoose.Types.ObjectId(params.actorId.toString()) : undefined,
        actorType: params.actorType,
        actorEmail: params.actorEmail,
        eventType: params.eventType,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: sanitizedMeta,
        correlationId: params.correlationId,
        timestamp: new Date(),
      });

      return await entry.save();
    } catch (err) {
      console.error("Failed to write audit log:", err);
      // Non-blocking in operational flow, return dummy if failure
      return new AuditLog(params);
    }
  }
}

export const auditLogRepository = new AuditLogRepository();
