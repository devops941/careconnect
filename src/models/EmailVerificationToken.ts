import mongoose, { Schema, Document, Model } from "mongoose";
import { IDENTITY_TYPES, IdentityType } from "@/lib/constants";

export interface IEmailVerificationToken extends Document {
  identityId: mongoose.Types.ObjectId;
  identityType: IdentityType;
  hashedToken: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
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
      index: { expires: 0 },
    },
    consumedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "email_verification_tokens",
  }
);

export const EmailVerificationToken: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<IEmailVerificationToken>("EmailVerificationToken", EmailVerificationTokenSchema);
