"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Phone, Mail, FileText, MapPin, Check, Plus, Loader2, Info } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { FormError } from "../auth/FormError";

const AVAILABLE_DEPARTMENTS = [
  "Emergency & Trauma",
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Radiology",
  "Neurology",
  "Gynecology & Obstetrics",
  "ENT & Ophthalmology",
  "Oncology",
];

interface OnboardingFormProps {
  initialData?: {
    hospitalName?: string;
    tagline?: string;
    contactEmail?: string;
    emergencyPhone?: string;
    licenseNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    departments?: string[];
    emergency24x7?: boolean;
  };
}

export function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [hospitalName, setHospitalName] = useState(
    initialData?.hospitalName || "CareConnect Memorial Hospital"
  );
  const [tagline, setTagline] = useState(
    initialData?.tagline || "24/7 Clinical Care & Smart Queue Management"
  );
  const [contactEmail, setContactEmail] = useState(
    initialData?.contactEmail || "contact@hospital.health"
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    initialData?.emergencyPhone || "+91 44 2800 1000"
  );
  const [licenseNumber, setLicenseNumber] = useState(
    initialData?.licenseNumber || "HOSP-TN-2026-X99"
  );
  const [street, setStreet] = useState(initialData?.address?.street || "120 Medical Center Boulevard");
  const [city, setCity] = useState(initialData?.address?.city || "Chennai");
  const [state, setState] = useState(initialData?.address?.state || "Tamil Nadu");
  const [postalCode, setPostalCode] = useState(initialData?.address?.postalCode || "600001");
  const [emergency24x7, setEmergency24x7] = useState(initialData?.emergency24x7 ?? true);

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    initialData?.departments?.length
      ? initialData.departments
      : ["Emergency & Trauma", "General Medicine", "Cardiology", "Pediatrics"]
  );

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim()) {
      setFormError("Hospital Name is required.");
      return;
    }
    if (!contactEmail.trim()) {
      setFormError("Hospital Contact Email is required.");
      return;
    }
    if (!emergencyPhone.trim()) {
      setFormError("Emergency Contact Phone is required.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);

      const res = await fetch("/api/settings/hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName: hospitalName.trim(),
          tagline: tagline.trim(),
          contactEmail: contactEmail.trim(),
          emergencyPhone: emergencyPhone.trim(),
          licenseNumber: licenseNumber.trim(),
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: "India",
          },
          departments: selectedDepartments,
          emergency24x7,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save hospital profile.");
      }

      toast.success("Hospital onboarding completed successfully!");
      router.push("/staff/dashboard");
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={formError} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        {/* LEFT COLUMN: Identity & Emergency */}
        <div className="space-y-4">
          {/* Section 1: Hospital Identity */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <div className="w-6 h-6 rounded-md bg-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                1. Hospital / Organization Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Hospital Legal / Brand Name *"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. CareConnect Memorial Hospital"
                  className="h-9.5 text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Tagline / Slogan"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Center for Excellence in Emergency Care & Diagnostics"
                  className="h-9.5 text-xs"
                />
              </div>

              <Input
                label="Medical License / Registration No. *"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. HOSP-MED-2026-X1"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
                className="h-9.5 text-xs"
                required
              />

              <Input
                label="Administrative Contact Email *"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="admin@hospital.health"
                leftIcon={<Mail className="w-3.5 h-3.5" />}
                className="h-9.5 text-xs"
                required
              />
            </div>
          </div>

          {/* Section 2: Emergency & Dispatch */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center text-[#B91C1C]">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                2. Emergency Dispatch & Patient Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <Input
                label="24/7 Emergency Hotline Number *"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 44 2800 1000"
                leftIcon={<Phone className="w-3.5 h-3.5 text-[#B91C1C]" />}
                className="h-9.5 text-xs"
                required
              />

              <div className="pt-2 sm:pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none bg-white p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={emergency24x7}
                    onChange={(e) => setEmergency24x7(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-xs font-semibold text-[#1F2937]">
                    24/7 Emergency & Trauma Center
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Location & Departments */}
        <div className="space-y-4">
          {/* Section 3: Physical Address */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <div className="w-6 h-6 rounded-md bg-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                3. Hospital Location & Campus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <Input
                  label="Street Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 100 Healthcare Parkway"
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                  className="h-9.5 text-xs"
                  required
                />
              </div>

              <div>
                <Input
                  label="State *"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  className="h-9.5 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Departments */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                  4. Active Clinical Departments
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#0F766E] bg-white px-2 py-0.5 rounded-full border border-teal-200">
                {selectedDepartments.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/40 shadow-2xs font-bold"
                        : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{dept}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 ml-1" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span>
            You can update these details anytime from <strong>Settings &gt; Hospital Profile</strong>.
          </span>
        </div>

        <Button
          type="submit"
          size="md"
          isLoading={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 gap-2 font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl shadow-xs"
        >
          {isLoading ? "Saving Hospital Identity..." : "Complete Setup & Launch Dashboard"}
        </Button>
      </div>
    </form>
  );
}
