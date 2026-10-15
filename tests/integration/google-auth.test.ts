import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from "../test-db";
import { authService } from "@/server/services/auth.service";
import { googleAuthService } from "@/server/services/google-auth.service";
import { User } from "@/models/User";
import { AuthenticationError, AccountSuspendedError } from "@/server/errors/app-error";

describe("Google OAuth Authentication & Safe Linking", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    vi.restoreAllMocks();
  });

  it("should reject Google tokens when email is not verified by Google", async () => {
    vi.spyOn(googleAuthService, "verifyIdToken").mockRejectedValue(
      new AuthenticationError("Google account email is not verified.")
    );

    await expect(authService.loginWithGoogle("mock_unverified_token")).rejects.toThrow(
      AuthenticationError
    );
  });

  it("should safely link Google provider ID to an existing user with matching verified email", async () => {
    // Existing user with credentials
    const existing = await User.create({
      name: "Clinician Mark",
      email: "mark@careconnect.health",
      normalizedEmail: "mark@careconnect.health",
      role: "DOCTOR",
      status: "ACTIVE",
    });

    vi.spyOn(googleAuthService, "verifyIdToken").mockResolvedValue({
      sub: "google_sub_10928374",
      email: "mark@careconnect.health",
      email_verified: true,
      name: "Mark Henderson",
    });

    const result = await authService.loginWithGoogle("valid_mock_token");

    expect(result.token).toBeDefined();
    expect(result.user.id).toBe(existing._id.toString());
    expect(result.user.role).toBe("DOCTOR"); // Retains doctor role, not downgraded or elevated

    // Verify user record updated in database
    const updated = await User.findById(existing._id);
    expect(updated?.googleProviderId).toBe("google_sub_10928374");
    expect(updated?.authProviders).toContain("google");
  });

  it("should create a new PATIENT account when Google user does not exist", async () => {
    vi.spyOn(googleAuthService, "verifyIdToken").mockResolvedValue({
      sub: "google_sub_99887766",
      email: "newpatient@gmail.com",
      email_verified: true,
      name: "New Patient Google",
    });

    const result = await authService.loginWithGoogle("valid_new_user_token");

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe("newpatient@gmail.com");
    expect(result.user.role).toBe("PATIENT");

    const userDoc = await User.findOne({ normalizedEmail: "newpatient@gmail.com" });
    expect(userDoc).not.toBeNull();
    expect(userDoc?.role).toBe("PATIENT");
  });

  it("should reject Google login if account has been suspended", async () => {
    await User.create({
      name: "Suspended Doctor",
      email: "dr.suspended@careconnect.health",
      normalizedEmail: "dr.suspended@careconnect.health",
      googleProviderId: "google_sub_suspended",
      role: "DOCTOR",
      status: "SUSPENDED",
    });

    vi.spyOn(googleAuthService, "verifyIdToken").mockResolvedValue({
      sub: "google_sub_suspended",
      email: "dr.suspended@careconnect.health",
      email_verified: true,
      name: "Dr. Suspended",
    });

    await expect(authService.loginWithGoogle("token_for_suspended")).rejects.toThrow(
      AccountSuspendedError
    );
  });
});
