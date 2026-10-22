import React from "react";

export type StatusType =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE"
  | "PENDING"
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "EMERGENCY"
  | "NORMAL";

interface StatusBadgeProps {
  status: string;
  className?: string;
  labelMap?: Record<string, string>;
}

export function StatusBadge({ status, className = "", labelMap }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
    CONFIRMED: "bg-teal-50 text-teal-700 border-teal-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-200",
    CALLED: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
    IN_CONSULTATION: "bg-purple-50 text-purple-700 border-purple-200",
    WAITING: "bg-sky-50 text-sky-700 border-sky-200",
    SCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    NO_SHOW: "bg-rose-50 text-rose-700 border-rose-200",
    INACTIVE: "bg-gray-50 text-gray-700 border-gray-200",
    ON_LEAVE: "bg-orange-50 text-orange-700 border-orange-200",
    EMERGENCY: "bg-red-100 text-red-800 border-red-300 font-extrabold animate-pulse",
    NORMAL: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const currentStyle = styles[normalized] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wider uppercase ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {labelMap?.[normalized] || status.replace(/_/g, " ")}
    </span>
  );
}
