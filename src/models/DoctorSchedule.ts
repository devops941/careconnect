import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctorSchedule extends Document {
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  departmentName?: string;
  leaveType: "CASUAL" | "MEDICAL" | "CONFERENCE" | "EMERGENCY";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  replacementDoctorName?: string;
  shiftHours?: {
    morningSlot: string; // e.g. "09:00 AM - 01:00 PM"
    eveningSlot: string; // e.g. "05:00 PM - 08:00 PM"
  };
  createdAt: Date;
  updatedAt: Date;
}

const DoctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
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
    departmentName: {
      type: String,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ["CASUAL", "MEDICAL", "CONFERENCE", "EMERGENCY"],
      default: "CASUAL",
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["APPROVED", "PENDING", "REJECTED"],
      default: "APPROVED",
      index: true,
    },
    replacementDoctorName: {
      type: String,
      trim: true,
    },
    shiftHours: {
      morningSlot: { type: String, default: "09:00 AM - 01:00 PM" },
      eveningSlot: { type: String, default: "05:00 PM - 08:00 PM" },
    },
  },
  { timestamps: true }
);

export const DoctorSchedule: Model<IDoctorSchedule> =
  mongoose.models.DoctorSchedule ||
  mongoose.model<IDoctorSchedule>("DoctorSchedule", DoctorScheduleSchema);
