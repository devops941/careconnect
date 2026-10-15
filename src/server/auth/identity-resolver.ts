import { superAdminRepository } from "../repositories/super-admin.repository";
import { employeeRepository } from "../repositories/employee.repository";
import { patientRepository } from "../repositories/patient.repository";
import { userRepository } from "../repositories/user.repository";
import { IdentityType, UserRole, AccountStatus, IDENTITY_TYPES, USER_ROLES } from "@/lib/constants";
import { ConflictError } from "../errors/app-error";

export interface ResolvedIdentity {
  id: string;
  name: string;
  email: string;
  normalizedEmail: string;
  identityType: IdentityType;
  role: UserRole | "SUPER_ADMIN";
  status: AccountStatus;
  passwordHash?: string;
  googleProviderId?: string;
  authProviders: string[];
  department?: string;
  employeeId?: string;
  emailVerifiedAt?: Date;
}

export class IdentityResolver {
  /**
   * Enforces global uniqueness of normalized email across all identity collections.
   */
  async ensureEmailNotRegistered(normalizedEmail: string): Promise<void> {
    const superAdmin = await superAdminRepository.findByNormalizedEmail(normalizedEmail);
    if (superAdmin) throw new ConflictError("An account with this email address already exists.");

    const employee = await employeeRepository.findByNormalizedEmail(normalizedEmail);
    if (employee) throw new ConflictError("A hospital employee with this email already exists.");

    const patient = await patientRepository.findByNormalizedEmail(normalizedEmail);
    if (patient) throw new ConflictError("A patient account with this email already exists.");

    const user = await userRepository.findByNormalizedEmail(normalizedEmail);
    if (user) throw new ConflictError("An account with this email address already exists.");
  }

  /**
   * Resolves identity across super_admins, employees, patients, and users.
   */
  async findByNormalizedEmail(
    normalizedEmail: string,
    includePassword = false
  ): Promise<ResolvedIdentity | null> {
    // 1. Check Super Admins first
    const superAdmin = await superAdminRepository.findByNormalizedEmail(normalizedEmail, includePassword);
    if (superAdmin) {
      return {
        id: superAdmin._id.toString(),
        name: superAdmin.name,
        email: superAdmin.email,
        normalizedEmail: superAdmin.normalizedEmail,
        identityType: IDENTITY_TYPES.SUPER_ADMIN,
        role: "SUPER_ADMIN",
        status: superAdmin.status,
        passwordHash: superAdmin.passwordHash,
        googleProviderId: superAdmin.googleProviderId,
        authProviders: superAdmin.authProviders,
        emailVerifiedAt: superAdmin.emailVerifiedAt,
      };
    }

    // 2. Check Employees (Doctors, Receptionists, Admins)
    const employee = await employeeRepository.findByNormalizedEmail(normalizedEmail, includePassword);
    if (employee) {
      return {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email,
        normalizedEmail: employee.normalizedEmail,
        identityType: IDENTITY_TYPES.EMPLOYEE,
        role: employee.role,
        status: employee.status,
        passwordHash: employee.passwordHash,
        authProviders: ["credentials"],
        department: employee.department,
        employeeId: employee.employeeId,
      };
    }

    // 3. Check Dedicated Patients collection
    const patient = await patientRepository.findByNormalizedEmail(normalizedEmail, includePassword);
    if (patient) {
      return {
        id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        normalizedEmail: patient.normalizedEmail,
        identityType: IDENTITY_TYPES.PATIENT,
        role: USER_ROLES.PATIENT,
        status: patient.status,
        passwordHash: patient.passwordHash,
        googleProviderId: patient.googleProviderId,
        authProviders: patient.authProviders,
        emailVerifiedAt: patient.emailVerifiedAt,
      };
    }

    // 4. Check standard Users collection
    const user = await userRepository.findByNormalizedEmail(normalizedEmail, includePassword);
    if (user) {
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        normalizedEmail: user.normalizedEmail,
        identityType: user.role === USER_ROLES.PATIENT ? IDENTITY_TYPES.PATIENT : IDENTITY_TYPES.USER,
        role: user.role,
        status: user.status,
        passwordHash: user.passwordHash,
        googleProviderId: user.googleProviderId,
        authProviders: user.authProviders,
        emailVerifiedAt: user.emailVerifiedAt,
      };
    }

    return null;
  }

  /**
   * Resolves employee by staff ID (e.g. DOC-101)
   */
  async findByEmployeeId(
    employeeId: string,
    includePassword = false
  ): Promise<ResolvedIdentity | null> {
    const employee = await employeeRepository.findByEmployeeId(employeeId, includePassword);
    if (!employee) return null;
    return {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      normalizedEmail: employee.normalizedEmail,
      identityType: IDENTITY_TYPES.EMPLOYEE,
      role: employee.role,
      status: employee.status,
      passwordHash: employee.passwordHash,
      authProviders: ["credentials"],
      department: employee.department,
      employeeId: employee.employeeId,
    };
  }

  /**
   * Resolves an identity by ID and IdentityType.
   */
  async findById(
    id: string,
    identityType: IdentityType,
    includePassword = false
  ): Promise<ResolvedIdentity | null> {
    if (identityType === IDENTITY_TYPES.SUPER_ADMIN) {
      const superAdmin = await superAdminRepository.findById(id, includePassword);
      if (!superAdmin) return null;
      return {
        id: superAdmin._id.toString(),
        name: superAdmin.name,
        email: superAdmin.email,
        normalizedEmail: superAdmin.normalizedEmail,
        identityType: IDENTITY_TYPES.SUPER_ADMIN,
        role: "SUPER_ADMIN",
        status: superAdmin.status,
        passwordHash: superAdmin.passwordHash,
        googleProviderId: superAdmin.googleProviderId,
        authProviders: superAdmin.authProviders,
        emailVerifiedAt: superAdmin.emailVerifiedAt,
      };
    }

    if (identityType === IDENTITY_TYPES.EMPLOYEE) {
      const employee = await employeeRepository.findById(id, includePassword);
      if (!employee) return null;
      return {
        id: employee._id.toString(),
        name: employee.name,
        email: employee.email,
        normalizedEmail: employee.normalizedEmail,
        identityType: IDENTITY_TYPES.EMPLOYEE,
        role: employee.role,
        status: employee.status,
        passwordHash: employee.passwordHash,
        authProviders: ["credentials"],
        department: employee.department,
        employeeId: employee.employeeId,
      };
    }

    if (identityType === IDENTITY_TYPES.PATIENT) {
      const patient = await patientRepository.findById(id, includePassword);
      if (patient) {
        return {
          id: patient._id.toString(),
          name: patient.name,
          email: patient.email,
          normalizedEmail: patient.normalizedEmail,
          identityType: IDENTITY_TYPES.PATIENT,
          role: USER_ROLES.PATIENT,
          status: patient.status,
          passwordHash: patient.passwordHash,
          googleProviderId: patient.googleProviderId,
          authProviders: patient.authProviders,
          emailVerifiedAt: patient.emailVerifiedAt,
        };
      }
    }

    const user = await userRepository.findById(id, includePassword);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      normalizedEmail: user.normalizedEmail,
      identityType: user.role === USER_ROLES.PATIENT ? IDENTITY_TYPES.PATIENT : IDENTITY_TYPES.USER,
      role: user.role,
      status: user.status,
      passwordHash: user.passwordHash,
      googleProviderId: user.googleProviderId,
      authProviders: user.authProviders,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  /**
   * Resolves identity by external Google Provider ID.
   */
  async findByGoogleId(googleProviderId: string): Promise<ResolvedIdentity | null> {
    const superAdmin = await superAdminRepository.findByGoogleId(googleProviderId);
    if (superAdmin) {
      return {
        id: superAdmin._id.toString(),
        name: superAdmin.name,
        email: superAdmin.email,
        normalizedEmail: superAdmin.normalizedEmail,
        identityType: IDENTITY_TYPES.SUPER_ADMIN,
        role: "SUPER_ADMIN",
        status: superAdmin.status,
        passwordHash: superAdmin.passwordHash,
        googleProviderId: superAdmin.googleProviderId,
        authProviders: superAdmin.authProviders,
        emailVerifiedAt: superAdmin.emailVerifiedAt,
      };
    }

    const patient = await patientRepository.findByGoogleId(googleProviderId);
    if (patient) {
      return {
        id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        normalizedEmail: patient.normalizedEmail,
        identityType: IDENTITY_TYPES.PATIENT,
        role: USER_ROLES.PATIENT,
        status: patient.status,
        passwordHash: patient.passwordHash,
        googleProviderId: patient.googleProviderId,
        authProviders: patient.authProviders,
        emailVerifiedAt: patient.emailVerifiedAt,
      };
    }

    const user = await userRepository.findByGoogleId(googleProviderId);
    if (user) {
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        normalizedEmail: user.normalizedEmail,
        identityType: IDENTITY_TYPES.USER,
        role: user.role,
        status: user.status,
        passwordHash: user.passwordHash,
        googleProviderId: user.googleProviderId,
        authProviders: user.authProviders,
        emailVerifiedAt: user.emailVerifiedAt,
      };
    }

    return null;
  }
}

export const identityResolver = new IdentityResolver();
