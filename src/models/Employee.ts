import mongoose, { Schema, Document, Model } from "mongoose";
import { ACCOUNT_STATUS, AccountStatus, UserRole } from "@/lib/constants";

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash: string;
  role: "DOCTOR" | "RECEPTIONIST" | "ADMIN";
  department: string;
  phone?: string;
  status: AccountStatus;
  lastLoginAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Employee name is required"],
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
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["DOCTOR", "RECEPTIONIST", "ADMIN"],
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      default: "General Medicine",
    },
    phone: {
      type: String,
      trim: true,
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

export const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
