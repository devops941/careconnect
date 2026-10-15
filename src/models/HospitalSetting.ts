import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospitalSetting extends Document {
  hospitalName: string;
  tagline?: string;
  contactEmail: string;
  emergencyPhone: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  departments: string[];
  emergency24x7: boolean;
  onboardingCompleted: boolean;
  setupCompletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSettingSchema = new Schema<IHospitalSetting>(
  {
    hospitalName: {
      type: String,
      required: [true, "Hospital or Organization name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
      default: "CareConnect Health Systems",
    },
    tagline: {
      type: String,
      trim: true,
      default: "Clinical Queue Coordination & Healthcare Appointments",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "support@careconnect.health",
    },
    emergencyPhone: {
      type: String,
      trim: true,
      default: "+91 44 2800 1000",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "HOSP-MED-2026-X1",
    },
    address: {
      street: { type: String, default: "100 Healthcare Parkway" },
      city: { type: String, default: "Chennai" },
      state: { type: String, default: "Tamil Nadu" },
      postalCode: { type: String, default: "600001" },
      country: { type: String, default: "India" },
    },
    departments: {
      type: [String],
      default: [
        "Emergency & Trauma",
        "General Medicine",
        "Cardiology",
        "Pediatrics",
        "Orthopedics",
        "Radiology",
      ],
    },
    emergency24x7: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    setupCompletedBy: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
  },
  {
    timestamps: true,
    collection: "hospital_settings",
  }
);

export const HospitalSetting: Model<IHospitalSetting> =
  mongoose.models.HospitalSetting ||
  mongoose.model<IHospitalSetting>("HospitalSetting", HospitalSettingSchema);
