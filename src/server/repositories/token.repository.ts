import mongoose from "mongoose";
import { PasswordResetToken, IPasswordResetToken } from "@/models/PasswordResetToken";
import { EmailVerificationToken, IEmailVerificationToken } from "@/models/EmailVerificationToken";
import { connectToDatabase } from "../database/mongodb";
import { IdentityType } from "@/lib/constants";

export interface CreateTokenDto {
  identityId: mongoose.Types.ObjectId;
  identityType: IdentityType;
  hashedToken: string;
  expiresAt: Date;
}

export class TokenRepository {
  // Password Reset Tokens
  async createPasswordResetToken(data: CreateTokenDto): Promise<IPasswordResetToken> {
    await connectToDatabase();
    // Invalidate existing pending tokens for this identity
    await PasswordResetToken.updateMany(
      { identityId: data.identityId, consumedAt: { $exists: false } },
      { consumedAt: new Date() }
    );
    const doc = new PasswordResetToken(data);
    return doc.save();
  }

  async findValidPasswordResetToken(hashedToken: string): Promise<IPasswordResetToken | null> {
    await connectToDatabase();
    return PasswordResetToken.findOne({
      hashedToken,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  async markPasswordResetTokenConsumed(id: string): Promise<void> {
    await connectToDatabase();
    await PasswordResetToken.findByIdAndUpdate(id, { consumedAt: new Date() }).exec();
  }

  // Email Verification Tokens
  async createEmailVerificationToken(data: CreateTokenDto): Promise<IEmailVerificationToken> {
    await connectToDatabase();
    await EmailVerificationToken.updateMany(
      { identityId: data.identityId, consumedAt: { $exists: false } },
      { consumedAt: new Date() }
    );
    const doc = new EmailVerificationToken(data);
    return doc.save();
  }

  async findValidEmailVerificationToken(hashedToken: string): Promise<IEmailVerificationToken | null> {
    await connectToDatabase();
    return EmailVerificationToken.findOne({
      hashedToken,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).exec();
  }

  async markEmailVerificationTokenConsumed(id: string): Promise<void> {
    await connectToDatabase();
    await EmailVerificationToken.findByIdAndUpdate(id, { consumedAt: new Date() }).exec();
  }
}

export const tokenRepository = new TokenRepository();
