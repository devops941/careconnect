import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#1F2937]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#64748B]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-11 px-3.5 bg-white border rounded-lg text-sm text-[#1F2937] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] disabled:bg-[#F8FAFC] disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20"
                : "border-[#E2E8F0]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-[#B91C1C]">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
