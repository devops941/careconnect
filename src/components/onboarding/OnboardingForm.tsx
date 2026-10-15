"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Phone, Mail, FileText, MapPin, Check, Plus, Loader2 } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormError message={formError} />

      {/* Section 1: Hospital Identity */}
      <div className="space-y-4">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F766E]" />
            <span>1. Hospital / Organization Identity</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            This name will appear on all patient appointments, queue screens, and top navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Hospital Legal / Brand Name *"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. CareConnect Memorial Hospital"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Tagline / Slogan"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Center for Excellence in Emergency Care & Diagnostics"
            />
          </div>

          <Input
            label="Medical License / Registration No. *"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. HOSP-MED-2026-X1"
            leftIcon={<FileText className="w-4 h-4" />}
            required
          />

          <Input
            label="Administrative Contact Email *"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="admin@hospital.health"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
        </div>
      </div>

      {/* Section 2: Emergency & Dispatch */}
      <div className="space-y-4">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#B91C1C]" />
            <span>2. Emergency Dispatch & Patient Contact</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Emergency hotline shown to patients in distress and during appointment booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="24/7 Emergency Hotline Number *"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="+91 44 2800 1000"
            leftIcon={<Phone className="w-4 h-4 text-[#B91C1C]" />}
            required
          />

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emergency24x7}
                onChange={(e) => setEmergency24x7(e.target.checked)}
                className="w-5 h-5 rounded border-[#E2E8F0] text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-sm font-medium text-[#1F2937]">
                Hospital operates 24/7 Emergency & Trauma Center
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Physical Address */}
      <div className="space-y-4">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0F766E]" />
            <span>3. Hospital Location & Campus</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2 md:col-span-2">
            <Input
              label="Street Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. 100 Healthcare Parkway"
            />
          </div>
          <Input
            label="City *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Chennai"
            required
          />
          <Input
            label="State *"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Tamil Nadu"
            required
          />
        </div>
      </div>

      {/* Section 4: Clinical Departments */}
      <div className="space-y-3">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h2 className="text-base font-bold text-[#16324F]">
            4. Active Clinical Departments (Select all applicable)
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Patients can book appointments and enter digital waiting queues for these departments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {AVAILABLE_DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartments.includes(dept);
            return (
              <button
                key={dept}
                type="button"
                onClick={() => toggleDepartment(dept)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]/40 shadow-xs"
                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                <span>{dept}</span>
                {isSelected ? (
                  <Check className="w-4 h-4 text-[#0F766E]" />
                ) : (
                  <Plus className="w-4 h-4 text-[#94A3B8]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#64748B]">
          ℹ️ You can update these details anytime from <strong>Settings &gt; Hospital Profile</strong>.
        </p>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full sm:w-auto px-8 gap-2 font-bold"
        >
          {isLoading ? "Saving Hospital Identity..." : "Complete Setup & Launch Dashboard"}
        </Button>
      </div>
    </form>
  );
}
