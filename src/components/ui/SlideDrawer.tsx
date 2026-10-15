"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export function SlideDrawer({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  children,
  width = "lg",
}: SlideDrawerProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClasses[width]} bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#16324F]">{title}</h2>
              {(description || subtitle) && (
                <p className="text-xs text-[#64748B] mt-0.5">{description || subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#64748B] hover:text-[#1F2937] hover:bg-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
