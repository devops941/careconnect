import { requireAuth, AuthenticatedContext } from "./require-auth";
import { RoleOrSuperAdmin, isAuthorizedRole } from "../auth/permissions";
import { ForbiddenError } from "../errors/app-error";

export async function requireRole(allowedRoles: RoleOrSuperAdmin[]): Promise<AuthenticatedContext> {
  const authContext = await requireAuth();

  if (!isAuthorizedRole(authContext.identity.role, allowedRoles)) {
    throw new ForbiddenError(
      `Access denied. This action requires one of the following roles: ${allowedRoles.join(", ")}`
    );
  }

  return authContext;
}
