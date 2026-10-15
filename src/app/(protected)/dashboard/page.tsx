import { redirect } from "next/navigation";
import { requireAuth } from "@/server/middleware/require-auth";
import { hospitalSettingRepository } from "@/server/repositories/hospital-setting.repository";

export default async function DashboardPage() {
  let authContext;
  try {
    authContext = await requireAuth();
  } catch {
    redirect("/login");
  }

  const { identity } = authContext;
  const hospitalSettings = await hospitalSettingRepository.getSettings();

  // If Super Admin and onboarding is not completed yet, route to onboarding immediately
  if (identity.role === "SUPER_ADMIN" && !hospitalSettings.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Strict role-based isolation redirect
  if (identity.role === "PATIENT") {
    redirect("/patient/dashboard");
  } else {
    redirect("/staff/dashboard");
  }
}
