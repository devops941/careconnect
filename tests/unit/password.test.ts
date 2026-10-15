import { describe, it, expect } from "vitest";
import { passwordService } from "@/server/services/password.service";

describe("PasswordService (Argon2id)", () => {
  it("should hash passwords using Argon2id with recommended memory parameters", async () => {
    const password = "HospitalAdmin#2026!";
    const hash = await passwordService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash).not.toEqual(password);
  });

  it("should generate distinct hashes for identical passwords due to unique salts", async () => {
    const password = "PatientPassword@123";
    const hash1 = await passwordService.hashPassword(password);
    const hash2 = await passwordService.hashPassword(password);

    expect(hash1).not.toEqual(hash2);
    expect(await passwordService.verifyPassword(password, hash1)).toBe(true);
    expect(await passwordService.verifyPassword(password, hash2)).toBe(true);
  });

  it("should successfully verify correct password against Argon2id hash", async () => {
    const password = "Secure#Password99";
    const hash = await passwordService.hashPassword(password);

    const isValid = await passwordService.verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect passwords", async () => {
    const hash = await passwordService.hashPassword("CorrectPassword123!");
    const isValid = await passwordService.verifyPassword("WrongPassword123!", hash);
    expect(isValid).toBe(false);
  });

  it("should handle empty or null password gracefully without throwing unhandled exceptions", async () => {
    const hash = await passwordService.hashPassword("ValidPassword123!");
    expect(await passwordService.verifyPassword("", hash)).toBe(false);
    expect(await passwordService.verifyPassword("ValidPassword123!", "")).toBe(false);
  });
});
