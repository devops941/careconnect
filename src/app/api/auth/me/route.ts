import { NextRequest } from "next/server";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();

    return sendSuccess({
      user: {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
        identityType: identity.identityType,
        status: identity.status,
        emailVerified: !!identity.emailVerifiedAt,
        authProviders: identity.authProviders,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
