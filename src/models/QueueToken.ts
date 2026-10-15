import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQueueToken extends Document {
  tokenNumber: string;
  tokenSequence: number;
  tokenDate: string; // YYYY-MM-DD
  patientName: string;
  patientId?: mongoose.Types.ObjectId;
  patientPhone?: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  departmentId: mongoose.Types.ObjectId;
  departmentName: string;
  appointmentId?: mongoose.Types.ObjectId;
  opdRoomNo: string;
  priority: "NORMAL" | "EMERGENCY";
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED";
  calledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QueueTokenSchema = new Schema<IQueueToken>(
  {
    tokenNumber: {
      type: String,
      required: true,
      index: true,
    },
    tokenSequence: {
      type: Number,
      required: true,
    },
    tokenDate: {
      type: String,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      index: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    opdRoomNo: {
      type: String,
      default: "Room 101",
    },
    priority: {
      type: String,
      enum: ["NORMAL", "EMERGENCY"],
      default: "NORMAL",
      index: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "CALLED", "IN_CONSULTATION", "COMPLETED", "SKIPPED"],
      default: "WAITING",
      index: true,
    },
    calledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "queue_tokens",
  }
);

export const QueueToken: Model<IQueueToken> =
  mongoose.models.QueueToken ||
  mongoose.model<IQueueToken>("QueueToken", QueueTokenSchema);
