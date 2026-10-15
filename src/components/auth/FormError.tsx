import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg flex items-start gap-2.5 text-sm text-[#B91C1C]"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B91C1C]" />
      <span className="leading-tight">{message}</span>
    </div>
  );
}
