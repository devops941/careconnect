import React from "react";
import { Activity, ShieldCheck, Clock, Stethoscope } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex">
      {/* Left Column: Hospital Branding and Visual Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#16324F] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle hospital accent shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0F766E]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight">CareConnect</span>
            <span className="block text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">
              Hospital Consultation & Queue Portal
            </span>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-[#CCFBF1] backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Official Hospital Management Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            Smart outpatient appointments and real-time clinic queue tracking.
          </h2>

          <p className="text-[#94A3B8] text-base leading-relaxed">
            CareConnect connects patients, clinicians, and hospital staff with instant token tracking,
            verified doctor consultations, and paperless digital billing.
          </p>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#0F766E] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">40% Less Wait</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Live queue tokens and automated wait-time estimation</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#0F766E] mb-1">
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">Top Specialists</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Cardiology, Neurology, Pediatrics, Orthopedics & Medicine</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#94A3B8] border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} CareConnect Health Systems</span>
          <span>Confidential Medical Records</span>
        </div>
      </div>

      {/* Right Column: Auth Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
