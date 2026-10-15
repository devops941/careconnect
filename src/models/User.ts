import mongoose, { Schema, Document, Model } from "mongoose";
import {
  USER_ROLES,
  UserRole,
  ACCOUNT_STATUS,
  AccountStatus,
  AUTH_PROVIDERS,
  AuthProvider,
} from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  googleProviderId?: string;
  authProviders: AuthProvider[];
  emailVerifiedAt?: Date;
  role: UserRole;
  status: AccountStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
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
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.PATIENT,
      index: true,
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
    collection: "users",
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
