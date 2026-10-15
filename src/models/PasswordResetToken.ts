import mongoose, { Schema, Document, Model } from "mongoose";
import { IDENTITY_TYPES, IdentityType } from "@/lib/constants";

export interface IPasswordResetToken extends Document {
  identityId: mongoose.Types.ObjectId;
  identityType: IdentityType;
  hashedToken: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    identityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    identityType: {
      type: String,
      enum: Object.values(IDENTITY_TYPES),
      required: true,
    },
    hashedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup
    },
    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "password_reset_tokens",
  }
);

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
