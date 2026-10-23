import { normalizeEmail } from "@/lib/utils";
import {
  USER_ROLES,
  ACCOUNT_STATUS,
  AUTH_PROVIDERS,
  IDENTITY_TYPES,
  AUDIT_EVENTS,
  IdentityType,
} from "@/lib/constants";
import { userRepository } from "../repositories/user.repository";
import { superAdminRepository } from "../repositories/super-admin.repository";
import { patientRepository } from "../repositories/patient.repository";
import { employeeRepository } from "../repositories/employee.repository";
import { tokenRepository } from "../repositories/token.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { identityResolver, ResolvedIdentity } from "../auth/identity-resolver";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";
import { emailService } from "./email.service";
import { googleAuthService } from "./google-auth.service";
import { sessionService } from "../auth/session";
import {
  AuthenticationError,
  AccountSuspendedError,
  AccountNotFoundError,
  ValidationError,
  ConflictError,
} from "../errors/app-error";
import { RegisterInput, LoginInput } from "@/features/auth/schemas/auth.schema";

export class AuthService {
  /**
   * Registers a new patient account with Argon2id password hashing and email verification.
   */
  async register(
    input: Omit<RegisterInput, "confirmPassword" | "termsAccepted">,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const normalized = normalizeEmail(input.email);

    // 1. Enforce global email uniqueness across super_admins and users
    await identityResolver.ensureEmailNotRegistered(normalized);

    // 2. Hash password with Argon2id
    const passwordHash = await passwordService.hashPassword(input.password);

    // 3. Create user strictly as PATIENT in users collection and dedicated patients collection
    const user = await userRepository.create({
      name: input.name.trim(),
      email: input.email.trim(),
      normalizedEmail: normalized,
      passwordHash,
      role: USER_ROLES.PATIENT,
      status: ACCOUNT_STATUS.ACTIVE,
    });

    await patientRepository.create({
      name: input.name.trim(),
      email: input.email.trim(),
      normalizedEmail: normalized,
      passwordHash,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    // 4. Generate email verification token
    const rawToken = tokenService.generateSecureToken();
    const hashedToken = tokenService.hashToken(rawToken);
    await tokenRepository.createEmailVerificationToken({
      identityId: user._id,
      identityType: IDENTITY_TYPES.USER,
      hashedToken,
      expiresAt: tokenService.getExpirationDate(24 * 60), // 24 hours
    });

    // 5. Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, rawToken);

    // 6. Audit log
    await auditLogRepository.log({
      actorId: user._id,
      actorType: IDENTITY_TYPES.USER,
      actorEmail: user.email,
      eventType: AUDIT_EVENTS.USER_REGISTERED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
      metadata: { role: USER_ROLES.PATIENT },
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  /**
   * Authenticates user or super admin credentials, verifies Argon2id hash, and creates session.
   */
  async loginWithCredentials(
    input: LoginInput,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const inputIdentifier = input.email.trim();
    let identity: ResolvedIdentity | null = null;

    // 1. If identifier doesn't contain '@', treat it as Employee ID (e.g. DOC-101)
    if (!inputIdentifier.includes("@")) {
      identity = await identityResolver.findByEmployeeId(inputIdentifier, true);
    } else {
      const normalized = normalizeEmail(inputIdentifier);
      identity = await identityResolver.findByNormalizedEmail(normalized, true);
    }

    if (!identity) {
      await auditLogRepository.log({
        actorEmail: inputIdentifier,
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
        metadata: { reason: "IDENTITY_NOT_FOUND" },
      });
      if (inputIdentifier.includes("@")) {
        throw new AccountNotFoundError("User Not Found. No registered account found with this email. Please register first.");
      }
      throw new AuthenticationError("User Not Found. Invalid employee ID or password.");
    }

    // Check account status
    if (identity.status === ACCOUNT_STATUS.SUSPENDED) {
      await auditLogRepository.log({
        actorId: identity.id,
        actorType: identity.identityType,
        actorEmail: identity.email,
        eventType: AUDIT_EVENTS.LOGIN_SUSPENDED,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
      });
      throw new AccountSuspendedError();
    }

    if (!identity.passwordHash) {
      await auditLogRepository.log({
        actorId: identity.id,
        actorType: identity.identityType,
        actorEmail: identity.email,
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
        metadata: { reason: "NO_PASSWORD_SET_USE_OAUTH" },
      });
      throw new AuthenticationError("Invalid email or password.");
    }

    // Verify password with Argon2id
    const isPasswordValid = await passwordService.verifyPassword(input.password, identity.passwordHash);
    if (!isPasswordValid) {
      await auditLogRepository.log({
        actorId: identity.id,
        actorType: identity.identityType,
        actorEmail: identity.email,
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
        metadata: { reason: "INVALID_PASSWORD" },
      });
      throw new AuthenticationError("Invalid email or password.");
    }

    // Update last login
    if (identity.identityType === IDENTITY_TYPES.SUPER_ADMIN) {
      await superAdminRepository.updateLastLogin(identity.id);
    } else if (identity.identityType === IDENTITY_TYPES.EMPLOYEE) {
      await employeeRepository.updateLastLogin(identity.id);
    } else if (identity.identityType === IDENTITY_TYPES.PATIENT) {
      await patientRepository.updateLastLogin(identity.id);
      await userRepository.updateLastLogin(identity.id);
    } else {
      await userRepository.updateLastLogin(identity.id);
    }

    // Audit log
    await auditLogRepository.log({
      actorId: identity.id,
      actorType: identity.identityType,
      actorEmail: identity.email,
      eventType: AUDIT_EVENTS.LOGIN_SUCCESS,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
    });

    // Create session token
    const token = sessionService.signSessionToken({
      sub: identity.id,
      email: identity.email,
      name: identity.name,
      identityType: identity.identityType,
      role: identity.role,
    });

    return {
      token,
      user: {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
        identityType: identity.identityType,
        status: identity.status,
        department: identity.department,
        employeeId: identity.employeeId,
      },
    };
  }

  /**
   * Provisions a hospital employee (Doctor, Receptionist, Admin) by Super Admin.
   */
  async createEmployee(
    input: {
      employeeId: string;
      name: string;
      email: string;
      role: "DOCTOR" | "RECEPTIONIST" | "NURSE" | "ADMIN";
      department: string;
      password: string;
      phone?: string;
    },
    adminId: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    const normalized = normalizeEmail(input.email);
    await identityResolver.ensureEmailNotRegistered(normalized);

    const existingEmpId = await employeeRepository.findByEmployeeId(input.employeeId);
    if (existingEmpId) {
      throw new ConflictError(`An employee with ID '${input.employeeId}' already exists.`);
    }

    const passwordHash = await passwordService.hashPassword(input.password);

    const employee = await employeeRepository.create({
      employeeId: input.employeeId.trim().toUpperCase(),
      name: input.name.trim(),
      email: input.email.trim(),
      normalizedEmail: normalized,
      passwordHash,
      role: input.role,
      department: input.department.trim(),
      phone: input.phone?.trim(),
      status: ACCOUNT_STATUS.ACTIVE,
      createdBy: adminId,
    });

    // Synchronize to Doctor collection if role is DOCTOR
    if (input.role === "DOCTOR") {
      try {
        const { Doctor } = await import("@/models/Doctor");
        const { Department } = await import("@/models/Department");
        let dept = await Department.findOne({ name: input.department.trim() });
        if (!dept) {
          dept = await Department.findOne();
        }
        if (dept) {
          await Doctor.findOneAndUpdate(
            { $or: [{ doctorId: employee.employeeId }, { email: employee.email }] },
            {
              $set: {
                doctorId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                specialization: `${employee.department} Specialist`,
                departmentId: dept._id,
                departmentName: dept.name,
                qualification: "MBBS, MD",
                experienceYears: 5,
                consultationFee: 500,
                opdRoomNo: "Room 201",
                status: "ACTIVE",
              },
            },
            { upsert: true, returnDocument: "after" }
          );
        }
      } catch (docSyncErr) {
        console.warn("Doctor sync notice:", docSyncErr);
      }
    }

    await auditLogRepository.log({
      actorId: adminId,
      actorType: IDENTITY_TYPES.SUPER_ADMIN,
      eventType: AUDIT_EVENTS.USER_REGISTERED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      metadata: {
        action: "EMPLOYEE_PROVISIONED",
        employeeId: employee.employeeId,
        role: employee.role,
        department: employee.department,
      },
    });

    return {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status,
    };
  }

  /**
   * Authenticates or links account via Google ID Token with verified email claim.
   */
  async loginWithGoogle(
    idToken: string,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const googleProfile = await googleAuthService.verifyIdToken(idToken);
    const normalized = normalizeEmail(googleProfile.email);

    // 1. Check if an account is already linked to this Google ID
    let identity = await identityResolver.findByGoogleId(googleProfile.sub);

    if (identity) {
      if (identity.status === ACCOUNT_STATUS.SUSPENDED) {
        throw new AccountSuspendedError();
      }

      if (identity.identityType === IDENTITY_TYPES.SUPER_ADMIN) {
        await superAdminRepository.updateLastLogin(identity.id);
      } else if (identity.identityType === IDENTITY_TYPES.PATIENT) {
        await patientRepository.updateLastLogin(identity.id);
      } else {
        await userRepository.updateLastLogin(identity.id);
      }

      await auditLogRepository.log({
        actorId: identity.id,
        actorType: identity.identityType,
        actorEmail: identity.email,
        eventType: AUDIT_EVENTS.GOOGLE_LOGIN_SUCCESS,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
      });

      const token = sessionService.signSessionToken({
        sub: identity.id,
        email: identity.email,
        name: identity.name,
        identityType: identity.identityType,
        role: identity.role,
      });

      return {
        token,
        user: {
          id: identity.id,
          name: identity.name,
          email: identity.email,
          role: identity.role,
          identityType: identity.identityType,
          status: identity.status,
        },
      };
    }

    // 2. Account not found by Google ID. Check if an existing account has the verified email.
    identity = await identityResolver.findByNormalizedEmail(normalized);

    if (identity) {
      // Safe account linking
      if (identity.status === ACCOUNT_STATUS.SUSPENDED) {
        throw new AccountSuspendedError();
      }

      if (identity.identityType === IDENTITY_TYPES.SUPER_ADMIN) {
        await superAdminRepository.linkGoogleAccount(identity.id, googleProfile.sub);
      } else if (identity.identityType === IDENTITY_TYPES.PATIENT) {
        await patientRepository.linkGoogleAccount(identity.id, googleProfile.sub);
      } else {
        await userRepository.linkGoogleAccount(identity.id, googleProfile.sub);
      }

      await auditLogRepository.log({
        actorId: identity.id,
        actorType: identity.identityType,
        actorEmail: identity.email,
        eventType: AUDIT_EVENTS.GOOGLE_ACCOUNT_LINKED,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        correlationId: context?.correlationId,
      });

      const token = sessionService.signSessionToken({
        sub: identity.id,
        email: identity.email,
        name: identity.name,
        identityType: identity.identityType,
        role: identity.role,
      });

      return {
        token,
        user: {
          id: identity.id,
          name: identity.name,
          email: identity.email,
          role: identity.role,
          identityType: identity.identityType,
          status: identity.status,
        },
      };
    }

    // 3. Brand new user registering via Google -> strictly create PATIENT
    const newUser = await userRepository.create({
      name: googleProfile.name,
      email: googleProfile.email,
      normalizedEmail: normalized,
      googleProviderId: googleProfile.sub,
      role: USER_ROLES.PATIENT,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    try {
      await patientRepository.create({
        name: googleProfile.name,
        email: googleProfile.email,
        normalizedEmail: normalized,
        googleProviderId: googleProfile.sub,
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      });
    } catch {
      // Ignore if patient document exists
    }

    await auditLogRepository.log({
      actorId: newUser._id,
      actorType: IDENTITY_TYPES.USER,
      actorEmail: newUser.email,
      eventType: AUDIT_EVENTS.USER_REGISTERED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
      metadata: { method: "GOOGLE_OAUTH", role: USER_ROLES.PATIENT },
    });

    const token = sessionService.signSessionToken({
      sub: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      identityType: IDENTITY_TYPES.USER,
      role: USER_ROLES.PATIENT,
    });

    return {
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: USER_ROLES.PATIENT,
        identityType: IDENTITY_TYPES.USER,
        status: newUser.status,
      },
    };
  }

  /**
   * Initiates password recovery. Prevents email enumeration by returning uniform success message.
   */
  async requestPasswordReset(
    email: string,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const normalized = normalizeEmail(email);
    const identity = await identityResolver.findByNormalizedEmail(normalized);

    // Uniform response prevents user enumeration
    if (!identity) {
      return { message: "If an account with this email exists, a password reset link has been dispatched." };
    }

    if (identity.status === ACCOUNT_STATUS.SUSPENDED) {
      return { message: "If an account with this email exists, a password reset link has been dispatched." };
    }

    const rawToken = tokenService.generateSecureToken();
    const hashedToken = tokenService.hashToken(rawToken);

    await tokenRepository.createPasswordResetToken({
      identityId: identity.id as any,
      identityType: identity.identityType,
      hashedToken,
      expiresAt: tokenService.getExpirationDate(60), // 60 minutes
    });

    await emailService.sendPasswordResetEmail(identity.email, identity.name, rawToken);

    await auditLogRepository.log({
      actorId: identity.id,
      actorType: identity.identityType,
      actorEmail: identity.email,
      eventType: AUDIT_EVENTS.PASSWORD_RESET_REQUESTED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
    });

    return { message: "If an account with this email exists, a password reset link has been dispatched." };
  }

  /**
   * Consumes a single-use password reset token and updates the password hash.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const hashedToken = tokenService.hashToken(token);
    const record = await tokenRepository.findValidPasswordResetToken(hashedToken);

    if (!record) {
      throw new ValidationError("Password reset token is invalid or has expired.");
    }

    const newHash = await passwordService.hashPassword(newPassword);

    if (record.identityType === IDENTITY_TYPES.SUPER_ADMIN) {
      await superAdminRepository.updatePassword(record.identityId.toString(), newHash);
    } else {
      await userRepository.updatePassword(record.identityId.toString(), newHash);
    }

    await tokenRepository.markPasswordResetTokenConsumed(record._id.toString());

    await auditLogRepository.log({
      actorId: record.identityId,
      actorType: record.identityType,
      eventType: AUDIT_EVENTS.PASSWORD_RESET_COMPLETED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
    });

    return { message: "Password has been successfully updated. You can now sign in with your new password." };
  }

  /**
   * Verifies an email verification token.
   */
  async verifyEmail(
    token: string,
    context?: { ip?: string; userAgent?: string; correlationId?: string }
  ) {
    const hashedToken = tokenService.hashToken(token);
    const record = await tokenRepository.findValidEmailVerificationToken(hashedToken);

    if (!record) {
      throw new ValidationError("Email verification token is invalid or has expired.");
    }

    if (record.identityType === IDENTITY_TYPES.USER) {
      await userRepository.verifyEmail(record.identityId.toString());
    }

    await tokenRepository.markEmailVerificationTokenConsumed(record._id.toString());

    await auditLogRepository.log({
      actorId: record.identityId,
      actorType: record.identityType,
      eventType: AUDIT_EVENTS.EMAIL_VERIFIED,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      correlationId: context?.correlationId,
    });

    return { message: "Your email address has been successfully verified." };
  }
}

export const authService = new AuthService();
