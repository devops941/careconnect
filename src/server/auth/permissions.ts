import { UserRole, USER_ROLES } from "@/lib/constants";

export type RoleOrSuperAdmin = UserRole | "SUPER_ADMIN";

export interface PermissionDefinition {
  canAccessAdminConsole: boolean;
  canManageUsers: boolean;
  canManageDoctors: boolean;
  canManageAppointments: boolean;
  canCheckInPatients: boolean;
  canViewMedicalRecords: boolean;
}

const ROLE_PERMISSIONS: Record<RoleOrSuperAdmin, PermissionDefinition> = {
  SUPER_ADMIN: {
    canAccessAdminConsole: true,
    canManageUsers: true,
    canManageDoctors: true,
    canManageAppointments: true,
    canCheckInPatients: true,
    canViewMedicalRecords: true,
  },
  ADMIN: {
    canAccessAdminConsole: true,
    canManageUsers: true,
    canManageDoctors: true,
    canManageAppointments: true,
    canCheckInPatients: true,
    canViewMedicalRecords: false,
  },
  DOCTOR: {
    canAccessAdminConsole: false,
    canManageUsers: false,
    canManageDoctors: false,
    canManageAppointments: true,
    canCheckInPatients: false,
    canViewMedicalRecords: true,
  },
  RECEPTIONIST: {
    canAccessAdminConsole: false,
    canManageUsers: false,
    canManageDoctors: false,
    canManageAppointments: true,
    canCheckInPatients: true,
    canViewMedicalRecords: false,
  },
  PATIENT: {
    canAccessAdminConsole: false,
    canManageUsers: false,
    canManageDoctors: false,
    canManageAppointments: false,
    canCheckInPatients: false,
    canViewMedicalRecords: false,
  },
};

export function hasPermission(role: RoleOrSuperAdmin, permission: keyof PermissionDefinition): boolean {
  return !!ROLE_PERMISSIONS[role]?.[permission];
}

export function isAuthorizedRole(userRole: RoleOrSuperAdmin, allowedRoles: RoleOrSuperAdmin[]): boolean {
  if (userRole === "SUPER_ADMIN") return true; // Super Admin has implicit elevation
  return allowedRoles.includes(userRole);
}
