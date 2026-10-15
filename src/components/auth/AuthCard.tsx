import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#16324F]">
            Care<span className="text-[#0F766E]">Connect</span>
          </span>
        </Link>
        <p className="text-xs uppercase tracking-wider font-semibold text-[#64748B] mt-1">
          Hospital Appointment & Queue Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-[#16324F] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[#64748B] mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>

        {children}

        {footer && <div className="mt-6 pt-5 border-t border-[#F1F5F9]">{footer}</div>}
      </div>

      {/* Security notice footer */}
      <div className="mt-6 text-center text-xs text-[#94A3B8]">
        <p>🔒 HIPAA & ISO 27001 Security Compliant Data Encryption</p>
      </div>
    </div>
  );
}
