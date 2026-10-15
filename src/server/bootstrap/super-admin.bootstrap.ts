import { normalizeEmail } from "@/lib/utils";
import { getEnv } from "../validation/env";
import { superAdminRepository } from "../repositories/super-admin.repository";
import { userRepository } from "../repositories/user.repository";
import { passwordService } from "../services/password.service";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { AUDIT_EVENTS, IDENTITY_TYPES, ACCOUNT_STATUS, AUTH_PROVIDERS } from "@/lib/constants";

export interface BootstrapResult {
  status: "CREATED" | "ALREADY_EXISTS" | "FAILED";
  message: string;
  superAdminId?: string;
  email?: string;
}

export async function bootstrapSuperAdmin(): Promise<BootstrapResult> {
  const env = getEnv();

  const name = env.SUPER_ADMIN_NAME?.trim();
  const rawEmail = env.SUPER_ADMIN_EMAIL?.trim();
  const initialPassword = env.SUPER_ADMIN_INITIAL_PASSWORD;

  if (!name || !rawEmail) {
    return {
      status: "FAILED",
      message: "SUPER_ADMIN_NAME and SUPER_ADMIN_EMAIL must be configured in environment variables.",
    };
  }

  const normalizedEmail = normalizeEmail(rawEmail);

  // 1. Guard against collision with normal users collection
  const existingUser = await userRepository.findByNormalizedEmail(normalizedEmail);
  if (existingUser) {
    return {
      status: "FAILED",
      message: `Safety violation: A regular user already exists with email '${normalizedEmail}'. Super Admin bootstrap cannot promote existing user accounts.`,
    };
  }

  // 2. Check if Super Admin already exists in dedicated super_admins collection
  const existingSuperAdmin = await superAdminRepository.findByNormalizedEmail(normalizedEmail);
  if (existingSuperAdmin) {
    return {
      status: "ALREADY_EXISTS",
      message: `Super Admin account for '${normalizedEmail}' already exists. Bootstrap execution was idempotent.`,
      superAdminId: existingSuperAdmin._id.toString(),
      email: existingSuperAdmin.email,
    };
  }

  // 3. Hash password using Argon2id
  let passwordHash: string | undefined;
  if (initialPassword) {
    passwordHash = await passwordService.hashPassword(initialPassword);
  }

  // 4. Create record in super_admins collection
  try {
    const created = await superAdminRepository.create({
      name,
      email: rawEmail,
      normalizedEmail,
      passwordHash,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    await auditLogRepository.log({
      actorId: created._id,
      actorType: IDENTITY_TYPES.SUPER_ADMIN,
      actorEmail: created.email,
      eventType: AUDIT_EVENTS.SUPER_ADMIN_BOOTSTRAP,
      metadata: { method: "CLI_BOOTSTRAP", email: normalizedEmail },
    });

    return {
      status: "CREATED",
      message: `Super Admin '${created.email}' successfully provisioned with Argon2id credentials.`,
      superAdminId: created._id.toString(),
      email: created.email,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      return {
        status: "ALREADY_EXISTS",
        message: `Concurrent execution handled: Super Admin with email '${normalizedEmail}' was already created.`,
      };
    }
    throw error;
  }
}
