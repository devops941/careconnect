import { hospitalSettingRepository, UpdateHospitalSettingDto } from "../repositories/hospital-setting.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { AUDIT_EVENTS, IDENTITY_TYPES } from "@/lib/constants";

export class HospitalSettingService {
  async getHospitalSettings() {
    const settings = await hospitalSettingRepository.getSettings();
    return {
      hospitalName: settings.hospitalName,
      tagline: settings.tagline,
      contactEmail: settings.contactEmail,
      emergencyPhone: settings.emergencyPhone,
      licenseNumber: settings.licenseNumber,
      address: settings.address,
      departments: settings.departments,
      emergency24x7: settings.emergency24x7,
      onboardingCompleted: settings.onboardingCompleted,
      updatedAt: settings.updatedAt,
    };
  }

  async completeOnboarding(
    data: UpdateHospitalSettingDto,
    adminId: string,
    adminEmail: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    const updated = await hospitalSettingRepository.updateSettings({
      ...data,
      onboardingCompleted: true,
      setupCompletedBy: adminId,
    });

    await auditLogRepository.log({
      actorId: adminId,
      actorType: IDENTITY_TYPES.SUPER_ADMIN,
      actorEmail: adminEmail,
      eventType: AUDIT_EVENTS.SUPER_ADMIN_BOOTSTRAP,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
      metadata: {
        action: "HOSPITAL_ONBOARDING_COMPLETED",
        hospitalName: updated.hospitalName,
      },
    });

    return {
      hospitalName: updated.hospitalName,
      tagline: updated.tagline,
      contactEmail: updated.contactEmail,
      emergencyPhone: updated.emergencyPhone,
      licenseNumber: updated.licenseNumber,
      address: updated.address,
      departments: updated.departments,
      emergency24x7: updated.emergency24x7,
      onboardingCompleted: updated.onboardingCompleted,
    };
  }
}

export const hospitalSettingService = new HospitalSettingService();
