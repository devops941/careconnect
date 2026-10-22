import { redirect } from "next/navigation";
import { requireAuth } from "@/server/middleware/require-auth";
import { hospitalSettingRepository } from "@/server/repositories/hospital-setting.repository";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Hospital Onboarding Setup | CareConnect",
  description: "Initial Super Admin hospital configuration and organization branding.",
};

export default async function OnboardingPage() {
  let authContext;
  try {
    authContext = await requireAuth();
  } catch {
    redirect("/login");
  }

  // Only Super Admin can access onboarding
  if (authContext.identity.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const settings = await hospitalSettingRepository.getSettings();

  return (
    <div className="min-h-screen bg-[#F5F8FA] py-4 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-3">
        {/* Simple Header */}
        <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-5 py-3 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#16324F] tracking-tight">
              Hospital Profile Setup
            </h1>
            <p className="text-xs text-[#64748B]">
              Configure hospital legal identity, emergency hotline, address, and active clinical departments.
            </p>
          </div>
        </div>

        {/* Onboarding Form Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6">
          <OnboardingForm initialData={JSON.parse(JSON.stringify(settings))} />
        </div>
      </div>
    </div>
  );
}
