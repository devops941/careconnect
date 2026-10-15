import { sessionService, SessionPayload } from "../auth/session";
import { ResolvedIdentity } from "../auth/identity-resolver";
import { AuthenticationError, AccountSuspendedError } from "../errors/app-error";

export interface AuthenticatedContext {
  session: SessionPayload;
  identity: ResolvedIdentity;
}

export async function requireAuth(): Promise<AuthenticatedContext> {
  const sessionResult = await sessionService.getCurrentSession();
  if (!sessionResult) {
    throw new AuthenticationError("Authentication required. Please sign in to continue.");
  }

  if (sessionResult.identity.status === "SUSPENDED") {
    throw new AccountSuspendedError();
  }

  return {
    session: sessionResult.payload,
    identity: sessionResult.identity,
  };
}
