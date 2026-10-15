import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  departmentName?: string;
  rating: number; // 1 to 5
  waitingTimeRating: number; // 1 to 5
  cleanlinessRating: number; // 1 to 5
  comments: string;
  status: "PUBLISHED" | "PENDING_REVIEW" | "HIDDEN";
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
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
    departmentName: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    waitingTimeRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    cleanlinessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "PENDING_REVIEW", "HIDDEN"],
      default: "PUBLISHED",
      index: true,
    },
  },
  { timestamps: true }
);

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
