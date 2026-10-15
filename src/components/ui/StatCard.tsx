import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "navy" | "amber" | "green" | "red";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "primary",
}: StatCardProps) {
  const iconVariants = {
    primary: "bg-[#CCFBF1] text-[#0F766E]",
    navy: "bg-[#E2E8F0] text-[#16324F]",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-xs uppercase font-bold text-[#64748B] tracking-wider block">
          {title}
        </span>
        <p className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[#64748B]">{subtitle}</p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconVariants[variant]}`}>
        <Icon className="w-6 h-6 stroke-[2.2]" />
      </div>
    </div>
  );
}
