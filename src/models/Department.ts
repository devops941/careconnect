import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  deptId: string;
  name: string;
  description?: string;
  headDoctorName?: string;
  opdRoomNo?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    deptId: {
      type: String,
      required: [true, "Department Code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Department Name is required"],
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headDoctorName: {
      type: String,
      trim: true,
    },
    opdRoomNo: {
      type: String,
      trim: true,
      default: "Room 101",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "departments",
  }
);

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);
