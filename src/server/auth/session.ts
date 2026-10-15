import crypto from "crypto";
import { cookies } from "next/headers";
import { getEnv } from "../validation/env";
import { COOKIE_NAME, SESSION_MAX_AGE_SECONDS, IdentityType, UserRole } from "@/lib/constants";
import { identityResolver, ResolvedIdentity } from "./identity-resolver";
import { AuthenticationError, AccountSuspendedError } from "../errors/app-error";

export interface SessionPayload {
  sub: string; // User or SuperAdmin ID
  email: string;
  name: string;
  identityType: IdentityType;
  role: UserRole | "SUPER_ADMIN";
  iat: number;
  exp: number;
  jti: string;
}

export class SessionService {
  private getSecret(): Buffer {
    const env = getEnv();
    return Buffer.from(env.AUTH_SECRET, "utf-8");
  }

  /**
   * Encodes and cryptographically signs a session token.
   */
  signSessionToken(payload: Omit<SessionPayload, "iat" | "exp" | "jti">): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: SessionPayload = {
      ...payload,
      iat: now,
      exp: now + SESSION_MAX_AGE_SECONDS,
      jti: crypto.randomBytes(16).toString("hex"),
    };

    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac("sha256", this.getSecret())
      .update(dataToSign)
      .digest("base64url");

    return `${dataToSign}.${signature}`;
  }

  /**
   * Verifies the cryptographic signature and expiration of a session token.
   */
  verifySessionToken(token: string): SessionPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [encodedHeader, encodedPayload, signature] = parts;
      const dataToSign = `${encodedHeader}.${encodedPayload}`;

      const expectedSignature = crypto
        .createHmac("sha256", this.getSecret())
        .update(dataToSign)
        .digest("base64url");

      // Constant-time comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as SessionPayload;
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Helper to serialize HTTP-only session cookie options.
   */
  getSessionCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
      name: COOKIE_NAME,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    };
  }

  /**
   * Validates the active request session and re-verifies live database status.
   */
  async getCurrentSession(): Promise<{ payload: SessionPayload; identity: ResolvedIdentity } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = this.verifySessionToken(token);
    if (!payload) return null;

    // Verify identity exists and account status is active
    const identity = await identityResolver.findById(payload.sub, payload.identityType);
    if (!identity) {
      return null;
    }

    if (identity.status === "SUSPENDED") {
      throw new AccountSuspendedError();
    }

    return { payload, identity };
  }
}

export const sessionService = new SessionService();
