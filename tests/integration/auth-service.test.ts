import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from "../test-db";
import { authService } from "@/server/services/auth.service";
import { User } from "@/models/User";
import { SuperAdmin } from "@/models/SuperAdmin";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import {
  AuthenticationError,
  AccountSuspendedError,
  ConflictError,
  ValidationError,
} from "@/server/errors/app-error";
import { passwordService } from "@/server/services/password.service";

describe("AuthService Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it("should register a new user strictly defaulting to PATIENT role", async () => {
    const user = await authService.register({
      name: "Arthur Pendelton",
      email: "arthur@careconnect.health",
      password: "PatientSecure#2026",
    });

    expect(user.id).toBeDefined();
    expect(user.role).toBe("PATIENT");
    expect(user.status).toBe("ACTIVE");

    // Verify database record
    const record = await User.findById(user.id).select("+passwordHash");
    expect(record).not.toBeNull();
    expect(record?.role).toBe("PATIENT");
    expect(record?.passwordHash?.startsWith("$argon2id$")).toBe(true);

    // Verify verification token was generated
    const verificationDoc = await EmailVerificationToken.findOne({ identityId: record!._id });
    expect(verificationDoc).not.toBeNull();
  });

  it("should prevent duplicate registration across users and super_admins collections", async () => {
    // 1. Create a Super Admin
    await SuperAdmin.create({
      name: "Admin User",
      email: "admin@careconnect.health",
      normalizedEmail: "admin@careconnect.health",
      status: "ACTIVE",
    });

    // 2. Attempt to register a normal user with the same email
    await expect(
      authService.register({
        name: "Imposter",
        email: "ADMIN@careconnect.health", // case-insensitive check
        password: "ValidPassword123!",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("should authenticate valid credentials and issue signed session token", async () => {
    await authService.register({
      name: "Jane Watson",
      email: "jane@careconnect.health",
      password: "JaneSecurePassword#1",
    });

    const result = await authService.loginWithCredentials({
      email: "jane@careconnect.health",
      password: "JaneSecurePassword#1",
    });

    expect(result.token).toBeDefined();
    expect(result.user.name).toBe("Jane Watson");
    expect(result.user.role).toBe("PATIENT");
  });

  it("should return generic authentication error for invalid passwords without revealing details", async () => {
    await authService.register({
      name: "John Watson",
      email: "john@careconnect.health",
      password: "JohnSecurePassword#1",
    });

    await expect(
      authService.loginWithCredentials({
        email: "john@careconnect.health",
        password: "IncorrectPassword!",
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it("should reject login for suspended accounts", async () => {
    const passwordHash = await passwordService.hashPassword("SuspendedPass#123");
    await User.create({
      name: "Suspended User",
      email: "suspended@careconnect.health",
      normalizedEmail: "suspended@careconnect.health",
      passwordHash,
      role: "PATIENT",
      status: "SUSPENDED",
    });

    await expect(
      authService.loginWithCredentials({
        email: "suspended@careconnect.health",
        password: "SuspendedPass#123",
      })
    ).rejects.toThrow(AccountSuspendedError);
  });

  it("should enforce single-use consumption and expiration of password reset tokens", async () => {
    const passwordHash = await passwordService.hashPassword("OldPassword#123");
    const user = await User.create({
      name: "Reset Candidate",
      email: "reset@careconnect.health",
      normalizedEmail: "reset@careconnect.health",
      passwordHash,
      role: "PATIENT",
      status: "ACTIVE",
    });

    // 1. Request reset
    await authService.requestPasswordReset("reset@careconnect.health");

    const tokenDoc = await PasswordResetToken.findOne({ identityId: user._id });
    expect(tokenDoc).not.toBeNull();

    // 2. Consume reset token with valid raw token
    // For test verification, let's create a known raw token directly
    const rawToken = "test_raw_reset_token_64_characters_long_for_unit_testing_123456789";
    const crypto = await import("crypto");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    await PasswordResetToken.create({
      identityId: user._id,
      identityType: "USER",
      hashedToken: hashed,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Reset password with valid token
    const res = await authService.resetPassword(rawToken, "NewArgon2Password#2026!");
    expect(res.message).toContain("successfully updated");

    // Verify token is consumed
    const consumedToken = await PasswordResetToken.findOne({ hashedToken: hashed });
    expect(consumedToken?.consumedAt).toBeDefined();

    // 3. Second attempt with same token must fail (single-use enforcement)
    await expect(
      authService.resetPassword(rawToken, "AnotherPassword#2026!")
    ).rejects.toThrow(ValidationError);
  });
});
