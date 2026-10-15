import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from "../test-db";
import { bootstrapSuperAdmin } from "@/server/bootstrap/super-admin.bootstrap";
import { SuperAdmin } from "@/models/SuperAdmin";
import { User } from "@/models/User";
import { passwordService } from "@/server/services/password.service";

describe("Super Admin Bootstrap Idempotency & Separation", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    process.env.SUPER_ADMIN_NAME = "Chief Executive Administrator";
    process.env.SUPER_ADMIN_EMAIL = "superadmin@careconnect.health";
    process.env.SUPER_ADMIN_INITIAL_PASSWORD = "CareConnect#Admin2026!";
  });

  it("should successfully bootstrap Super Admin into super_admins collection", async () => {
    const result = await bootstrapSuperAdmin();

    expect(result.status).toBe("CREATED");
    expect(result.email).toBe("superadmin@careconnect.health");

    // Check super_admins collection
    const superAdmin = await SuperAdmin.findOne({ normalizedEmail: "superadmin@careconnect.health" }).select("+passwordHash");
    expect(superAdmin).not.toBeNull();
    expect(superAdmin?.name).toBe("Chief Executive Administrator");
    expect(superAdmin?.passwordHash).toBeDefined();
    expect(superAdmin?.passwordHash?.startsWith("$argon2id$")).toBe(true);

    // Verify Argon2id password hash
    const isValid = await passwordService.verifyPassword("CareConnect#Admin2026!", superAdmin!.passwordHash!);
    expect(isValid).toBe(true);

    // Verify separation: MUST NOT exist in normal users collection
    const normalUser = await User.findOne({ normalizedEmail: "superadmin@careconnect.health" });
    expect(normalUser).toBeNull();
  });

  it("should be idempotent on repeated executions and prevent duplicate creations", async () => {
    // 1st run
    const result1 = await bootstrapSuperAdmin();
    expect(result1.status).toBe("CREATED");

    // 2nd run
    const result2 = await bootstrapSuperAdmin();
    expect(result2.status).toBe("ALREADY_EXISTS");

    // Total count in collection must still be strictly 1
    const count = await SuperAdmin.countDocuments();
    expect(count).toBe(1);
  });

  it("should refuse to promote an existing normal user to Super Admin", async () => {
    // Create regular user with same email
    await User.create({
      name: "Existing Patient",
      email: "superadmin@careconnect.health",
      normalizedEmail: "superadmin@careconnect.health",
      role: "PATIENT",
      status: "ACTIVE",
    });

    // Attempt bootstrap
    const result = await bootstrapSuperAdmin();
    expect(result.status).toBe("FAILED");
    expect(result.message).toContain("A regular user already exists");

    // Super admin count must be 0
    const count = await SuperAdmin.countDocuments();
    expect(count).toBe(0);
  });
});
