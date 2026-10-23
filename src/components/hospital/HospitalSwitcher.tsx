"use client";

import React, { useState, useEffect } from "react";
import { Building2, ChevronDown, Check, MapPin } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface HospitalOption {
  _id: string;
  name: string;
  code: string;
  address?: {
    city?: string;
  };
  isMainBranch?: boolean;
}

interface HospitalSwitcherProps {
  onHospitalChange?: (hospitalId: string) => void;
  selectedHospitalId?: string;
}

export function HospitalSwitcher({
  onHospitalChange,
  selectedHospitalId: externalHospitalId,
}: HospitalSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (externalHospitalId !== undefined) return externalHospitalId;
    if (typeof window !== "undefined") {
      const urlParam = searchParams.get("hospitalId");
      if (urlParam) return urlParam;
      const saved = localStorage.getItem("careconnect_selected_hospital");
      if (saved) return saved;
    }
    return "ALL";
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (externalHospitalId !== undefined) {
      setSelectedId(externalHospitalId);
    }
  }, [externalHospitalId]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/hospitals?status=ACTIVE");
        const data = await res.json();
        if (res.ok && data.success) {
          setHospitals(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load hospitals for switcher", err);
      }
    };
    fetchHospitals();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("careconnect_selected_hospital", id);
      // Dispatch custom event for child components to react instantly without full reload
      window.dispatchEvent(
        new CustomEvent("hospital-selection-change", { detail: { hospitalId: id } })
      );
    }
    if (onHospitalChange) {
      onHospitalChange(id);
    }
  };

  const currentHospital = hospitals.find((h) => h._id === selectedId);
  const displayLabel =
    selectedId === "ALL"
      ? "All Hospital Branches"
      : currentHospital?.name || "Select Hospital";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#16324F] transition-all max-w-[260px] truncate shadow-2xs"
        title={displayLabel}
      >
        <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="w-3 h-3 text-[#94A3B8] shrink-0 ml-auto" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1.5 z-40 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] border-b border-[#F1F5F9]">
              Filter Facility / Network
            </div>

            <button
              type="button"
              onClick={() => handleSelect("ALL")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-[#F8FAFC] text-left transition-colors ${
                selectedId === "ALL" ? "text-[#0F766E] font-bold bg-teal-50/50" : "text-[#16324F]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                <span>All Hospital Branches</span>
              </div>
              {selectedId === "ALL" && <Check className="w-3.5 h-3.5 text-[#0F766E]" />}
            </button>

            {hospitals.map((hosp) => {
              const isSelected = selectedId === hosp._id;
              return (
                <button
                  key={hosp._id}
                  type="button"
                  onClick={() => handleSelect(hosp._id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#F8FAFC] text-left transition-colors ${
                    isSelected ? "text-[#0F766E] font-bold bg-teal-50/50" : "text-[#16324F]"
                  }`}
                >
                  <div className="overflow-hidden leading-tight">
                    <span className="block truncate font-semibold">{hosp.name}</span>
                    <span className="block text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {hosp.address?.city || "Chennai"} • {hosp.code}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
