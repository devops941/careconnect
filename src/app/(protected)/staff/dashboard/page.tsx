import { redirect } from "next/navigation";
import { requireAuth } from "@/server/middleware/require-auth";
import { hospitalSettingRepository } from "@/server/repositories/hospital-setting.repository";
import { StaffDashboardClient } from "./StaffDashboardClient";

export const metadata = {
  title: "Hospital Staff Portal | CareConnect",
  description: "Clinical consultation desk, live queue engine, and administrative operations.",
};

export default async function StaffDashboardPage() {
  let authContext;
  try {
    authContext = await requireAuth();
  } catch {
    redirect("/login");
  }

  const { identity } = authContext;

  // Strict isolation: patients cannot access staff portal
  if (identity.role === "PATIENT") {
    redirect("/patient/dashboard");
  }

  const hospitalSettings = await hospitalSettingRepository.getSettings();

  // Super Admin onboarding gate
  if (identity.role === "SUPER_ADMIN" && !hospitalSettings.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StaffDashboardClient
      user={{
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
        department: identity.department,
        identityType: identity.identityType,
        status: identity.status,
      }}
      hospitalSettings={{
        hospitalName: hospitalSettings.hospitalName,
        tagline: hospitalSettings.tagline,
        contactEmail: hospitalSettings.contactEmail,
        emergencyPhone: hospitalSettings.emergencyPhone,
        licenseNumber: hospitalSettings.licenseNumber,
        address: hospitalSettings.address
          ? {
              street: hospitalSettings.address.street,
              city: hospitalSettings.address.city,
              state: hospitalSettings.address.state,
              postalCode: hospitalSettings.address.postalCode,
              country: hospitalSettings.address.country,
            }
          : undefined,
        departments: hospitalSettings.departments || [],
        emergency24x7: hospitalSettings.emergency24x7,
        onboardingCompleted: hospitalSettings.onboardingCompleted,
      }}
    />
  );
}
