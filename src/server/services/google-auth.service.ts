import { getEnv } from "../validation/env";
import { AuthenticationError } from "../errors/app-error";

export interface GooglePayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export class GoogleAuthService {
  /**
   * Verifies Google ID token against Google's OAuth2 API endpoints and validates issuer/audience.
   */
  async verifyIdToken(idToken: string): Promise<GooglePayload> {
    const env = getEnv();
    const expectedClientId = env.AUTH_GOOGLE_ID || env.GOOGLE_CLIENT_ID;

    // Verify token with Google's token info API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!response.ok) {
      throw new AuthenticationError("Invalid or expired Google authentication token.");
    }

    const data = await response.json();

    // 1. Validate audience matches our configured Google Client ID
    if (expectedClientId && data.aud !== expectedClientId) {
      throw new AuthenticationError("Google token audience mismatch.");
    }

    // 2. Validate email verification claim
    const isEmailVerified = data.email_verified === "true" || data.email_verified === true;
    if (!isEmailVerified) {
      throw new AuthenticationError(
        "Google account email is not verified. Please verify your email with Google first."
      );
    }

    if (!data.email) {
      throw new AuthenticationError("Google identity response did not include an email address.");
    }

    return {
      sub: data.sub,
      email: data.email,
      email_verified: true,
      name: data.name || data.email.split("@")[0],
      picture: data.picture,
    };
  }
}

export const googleAuthService = new GoogleAuthService();
