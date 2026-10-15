import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/server/middleware/require-auth";
import { hospitalSettingRepository } from "@/server/repositories/hospital-setting.repository";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Activity, ShieldCheck, Building2, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#F5F8FA] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Navigation back to Staff Dashboard */}
        <div className="flex items-center justify-between">
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#115E59] bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Staff Dashboard</span>
          </Link>

          <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
            Logged in as <strong>{authContext.identity.name}</strong> (SUPER_ADMIN)
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
            <ShieldCheck className="w-4 h-4" />
            <span>Hospital Configuration & Onboarding</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#16324F] tracking-tight">
              Hospital Profile Setup
            </h1>
          </div>

          <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto">
            Configure hospital legal details, emergency dispatch telephone numbers, and registered clinical departments below.
          </p>
        </div>

        {/* Onboarding Form Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-10">
          <OnboardingForm initialData={JSON.parse(JSON.stringify(settings))} />
        </div>
      </div>
    </div>
  );
}
