import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

export class PasswordService {
  /**
   * Hashes a plaintext password using Argon2id with recommended OWASP parameters.
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, {
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  /**
   * Verifies a password against an Argon2id (or fallback bcrypt) hash.
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !password) return false;

    // Detect Argon2 hash ($argon2id$, $argon2i$, $argon2d$)
    if (storedHash.startsWith("$argon2")) {
      try {
        return await verify(storedHash, password);
      } catch (err) {
        console.error("Argon2 verification error:", err);
        return false;
      }
    }

    // Fallback detection for bcrypt ($2a$, $2b$, $2y$)
    if (storedHash.startsWith("$2")) {
      try {
        return await bcrypt.compare(password, storedHash);
      } catch (err) {
        console.error("Bcrypt verification error:", err);
        return false;
      }
    }

    return false;
  }
}

export const passwordService = new PasswordService();
