import crypto from "crypto";

export class TokenService {
  /**
   * Generates a cryptographically secure random token (64 hex characters).
   */
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hashes a raw token with SHA-256 for persistent database storage.
   * Ensures that a database leak cannot compromise valid tokens.
   */
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Calculates an expiration Date given minutes from now.
   */
  getExpirationDate(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}

export const tokenService = new TokenService();
