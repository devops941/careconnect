import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospital extends Document {
  hospitalId: string;
  name: string;
  code: string;
  tagline?: string;
  contactEmail: string;
  phone?: string;
  emergencyPhone: string;
  licenseNumber?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  departments: string[];
  emergency24x7: boolean;
  status: "ACTIVE" | "INACTIVE";
  isMainBranch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalId: {
      type: String,
      required: [true, "Hospital ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Hospital Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Hospital Branch Code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "Clinical Queue Coordination & Healthcare Facility",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "hospital@careconnect.health",
    },
    phone: {
      type: String,
      trim: true,
      default: "+91 44 2800 1000",
    },
    emergencyPhone: {
      type: String,
      trim: true,
      default: "+91 44 2800 1000",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "HOSP-MED-LIC-2026",
    },
    address: {
      street: { type: String, default: "Main Healthcare Avenue" },
      city: { type: String, default: "Chennai" },
      state: { type: String, default: "Tamil Nadu" },
      postalCode: { type: String, default: "600001" },
      country: { type: String, default: "India" },
    },
    departments: {
      type: [String],
      default: [
        "General Medicine",
        "Cardiology",
        "Emergency & Trauma",
        "Pediatrics",
        "Orthopedics",
        "Radiology",
      ],
    },
    emergency24x7: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    isMainBranch: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "hospitals",
  }
);

export const Hospital: Model<IHospital> =
  mongoose.models.Hospital || mongoose.model<IHospital>("Hospital", HospitalSchema);
