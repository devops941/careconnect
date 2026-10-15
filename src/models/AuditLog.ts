import mongoose, { Schema, Document, Model } from "mongoose";
import { IDENTITY_TYPES, IdentityType, AUDIT_EVENTS, AuditEventType } from "@/lib/constants";

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorType?: IdentityType;
  actorEmail?: string;
  eventType: AuditEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    actorType: {
      type: String,
      enum: Object.values(IDENTITY_TYPES),
    },
    actorEmail: {
      type: String,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(AUDIT_EVENTS),
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    correlationId: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: "audit_logs",
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
