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
  vitals?: {
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    bmiCategory?: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    bpFormatted?: string;
    pulseBpm?: number;
    tempFahrenheit?: number;
    spo2Percent?: number;
    respiratoryRate?: number;
    rbsMgDl?: number;
    allergies?: string;
    chiefComplaints?: string;
    nurseNotes?: string;
    recordedByNurseId?: mongoose.Types.ObjectId;
    recordedByNurseName?: string;
    recordedAt?: Date;
  };
  vitalsStatus: "PENDING" | "RECORDED";
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
    vitals: {
      heightCm: { type: Number },
      weightKg: { type: Number },
      bmi: { type: Number },
      bmiCategory: { type: String, trim: true },
      bpSystolic: { type: Number },
      bpDiastolic: { type: Number },
      bpFormatted: { type: String, trim: true },
      pulseBpm: { type: Number },
      tempFahrenheit: { type: Number },
      spo2Percent: { type: Number },
      respiratoryRate: { type: Number },
      rbsMgDl: { type: Number },
      allergies: { type: String, trim: true },
      chiefComplaints: { type: String, trim: true },
      nurseNotes: { type: String, trim: true },
      recordedByNurseId: { type: Schema.Types.ObjectId, ref: "Employee" },
      recordedByNurseName: { type: String, trim: true },
      recordedAt: { type: Date },
    },
    vitalsStatus: {
      type: String,
      enum: ["PENDING", "RECORDED"],
      default: "PENDING",
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
