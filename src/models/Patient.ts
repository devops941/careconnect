import mongoose, { Schema, Document, Model } from "mongoose";
import { ACCOUNT_STATUS, AccountStatus, AUTH_PROVIDERS, AuthProvider } from "@/lib/constants";

export interface IPatient extends Document {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  phone?: string;
  bloodGroup?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  googleProviderId?: string;
  authProviders: AuthProvider[];
  emailVerifiedAt?: Date;
  status: AccountStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, "Patient full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    normalizedEmail: {
      type: String,
      required: [true, "Normalized email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"],
      default: "UNKNOWN",
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    googleProviderId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    authProviders: {
      type: [String],
      enum: Object.values(AUTH_PROVIDERS),
      default: [AUTH_PROVIDERS.CREDENTIALS],
    },
    emailVerifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "patients",
  }
);

export const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
