import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  appointmentId: string;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  departmentId: mongoose.Types.ObjectId;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  type: "IN_PERSON" | "FOLLOW_UP" | "EMERGENCY";
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "IN_CONSULTATION"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  tokenNumber?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    patientEmail: {
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
    appointmentDate: {
      type: String,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["IN_PERSON", "FOLLOW_UP", "EMERGENCY"],
      default: "IN_PERSON",
    },
    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "CONFIRMED",
        "CHECKED_IN",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "CONFIRMED",
      index: true,
    },
    tokenNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "appointments",
  }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
