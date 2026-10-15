import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctor extends Document {
  doctorId: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  departmentId: mongoose.Types.ObjectId;
  departmentName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  medicalCouncilRegNo?: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  opdRoomNo: string;
  availableDays: string[];
  timeSlots: string[];
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Doctor Name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Doctor email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
      index: true,
    },
    departmentName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE",
    },
    medicalCouncilRegNo: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      default: "MBBS, MD",
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0,
    },
    consultationFee: {
      type: Number,
      default: 500,
      min: 0,
    },
    opdRoomNo: {
      type: String,
      default: "Room 201",
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    timeSlots: {
      type: [String],
      default: [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
      ],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "doctors",
  }
);

export const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);
