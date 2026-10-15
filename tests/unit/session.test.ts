import { describe, it, expect } from "vitest";
import { sessionService } from "@/server/auth/session";

describe("SessionService (Cryptographic Cookie Token)", () => {
  it("should sign and verify valid session tokens", () => {
    const payload = {
      sub: "650123456789abcdef012345",
      email: "doctor@careconnect.health",
      name: "Dr. Sarah Jenkins",
      identityType: "USER" as const,
      role: "DOCTOR" as const,
    };

    const token = sessionService.signSessionToken(payload);
    expect(token).toBeDefined();
    expect(token.split(".").length).toBe(3);

    const decoded = sessionService.verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.identityType).toBe(payload.identityType);
  });

  it("should reject tampered session tokens", () => {
    const payload = {
      sub: "650123456789abcdef012345",
      email: "patient@careconnect.health",
      name: "John Doe",
      identityType: "USER" as const,
      role: "PATIENT" as const,
    };

    const token = sessionService.signSessionToken(payload);
    const parts = token.split(".");
    // Tamper with payload (middle segment)
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...payload, role: "SUPER_ADMIN" })
    ).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const result = sessionService.verifySessionToken(tamperedToken);
    expect(result).toBeNull();
  });

  it("should reject malformed token strings", () => {
    expect(sessionService.verifySessionToken("invalid-token")).toBeNull();
    expect(sessionService.verifySessionToken("")).toBeNull();
    expect(sessionService.verifySessionToken("a.b")).toBeNull();
  });
});
