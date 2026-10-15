import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientEmail: string;
  recipientType: "PATIENT" | "EMPLOYEE";
  title: string;
  message: string;
  type: "APPOINTMENT" | "QUEUE" | "SCHEDULE" | "SYSTEM" | "BILLING";
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["PATIENT", "EMPLOYEE"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["APPOINTMENT", "QUEUE", "SCHEDULE", "SYSTEM", "BILLING"],
      default: "SYSTEM",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "notifications",
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
