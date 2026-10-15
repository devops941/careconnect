import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-[#0F766E] text-white hover:bg-[#115E59] focus:ring-[#0F766E] shadow-sm active:bg-[#0D625C]",
      secondary:
        "bg-[#16324F] text-white hover:bg-[#11273E] focus:ring-[#16324F] shadow-sm",
      outline:
        "border border-[#E2E8F0] bg-white text-[#1F2937] hover:bg-[#F8FAFC] focus:ring-[#0F766E]",
      ghost:
        "bg-transparent text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9] focus:ring-[#0F766E]",
      danger:
        "bg-[#B91C1C] text-white hover:bg-[#991B1B] focus:ring-[#B91C1C] shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
