import mongoose, { Schema, Document, Model } from "mongoose";
import { ACCOUNT_STATUS, AccountStatus, AUTH_PROVIDERS, AuthProvider } from "@/lib/constants";

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  googleProviderId?: string;
  authProviders: AuthProvider[];
  emailVerifiedAt?: Date;
  status: AccountStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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
    collection: "super_admins",
  }
);

// Prevent re-compilation across Next.js hot-reloads
export const SuperAdmin: Model<ISuperAdmin> =
  mongoose.models.SuperAdmin || mongoose.model<ISuperAdmin>("SuperAdmin", SuperAdminSchema);
