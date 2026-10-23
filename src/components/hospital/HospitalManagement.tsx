"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Clock,
  ArrowLeft,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

export interface HospitalBranch {
  _id: string;
  hospitalId: string;
  name: string;
  code: string;
  tagline?: string;
  contactEmail: string;
  phone?: string;
  emergencyPhone: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  departments: string[];
  emergency24x7: boolean;
  status: "ACTIVE" | "INACTIVE";
  isMainBranch: boolean;
  doctorCount?: number;
}

const AVAILABLE_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Radiology",
  "Emergency & Trauma",
  "Neurology",
  "Dermatology",
  "ENT & Ophthalmology",
  "Gynecology",
];

interface HospitalManagementProps {
  onSelectHospitalBranch?: (hospitalId: string) => void;
}

export function HospitalManagement({ onSelectHospitalBranch }: HospitalManagementProps = {}) {
  const [hospitals, setHospitals] = useState<HospitalBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tagline, setTagline] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Chennai");
  const [state, setState] = useState("Tamil Nadu");
  const [postalCode, setPostalCode] = useState("600001");
  const [country, setCountry] = useState("India");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    "General Medicine",
    "Emergency & Trauma",
    "Cardiology",
  ]);
  const [emergency24x7, setEmergency24x7] = useState(true);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isMainBranch, setIsMainBranch] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/hospitals");
      const data = await res.json();
      if (res.ok && data.success) {
        setHospitals(data.data || []);
      }
    } catch {
      toast.error("Failed to load hospitals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const resetForm = () => {
    setName("");
    setCode("");
    setTagline("");
    setContactEmail("");
    setPhone("");
    setEmergencyPhone("+91 44 2800 1000");
    setLicenseNumber("");
    setStreet("");
    setCity("Chennai");
    setState("Tamil Nadu");
    setPostalCode("600001");
    setCountry("India");
    setSelectedDepts(["General Medicine", "Emergency & Trauma", "Cardiology"]);
    setEmergency24x7(true);
    setStatus("ACTIVE");
    setIsMainBranch(false);
    setFormError(null);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const handleOpenEdit = (hosp: HospitalBranch) => {
    setEditingId(hosp._id);
    setName(hosp.name);
    setCode(hosp.code);
    setTagline(hosp.tagline || "");
    setContactEmail(hosp.contactEmail);
    setPhone(hosp.phone || "");
    setEmergencyPhone(hosp.emergencyPhone);
    setLicenseNumber(hosp.licenseNumber || "");
    setStreet(hosp.address?.street || "");
    setCity(hosp.address?.city || "Chennai");
    setState(hosp.address?.state || "Tamil Nadu");
    setPostalCode(hosp.address?.postalCode || "600001");
    setCountry(hosp.address?.country || "India");
    setSelectedDepts(hosp.departments || []);
    setEmergency24x7(hosp.emergency24x7);
    setStatus(hosp.status);
    setIsMainBranch(hosp.isMainBranch);
    setFormError(null);
    setViewMode("edit");
  };

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length === 1) {
        toast.warning("At least one department is required.");
        return;
      }
      setSelectedDepts(selectedDepts.filter((d) => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !code.trim() || !contactEmail.trim() || !emergencyPhone.trim()) {
      setFormError("Hospital Name, Code, Email, and Emergency Phone are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        tagline: tagline.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        phone: phone.trim(),
        emergencyPhone: emergencyPhone.trim(),
        licenseNumber: licenseNumber.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        departments: selectedDepts,
        emergency24x7,
        status,
        isMainBranch,
      };

      const url = editingId ? `/api/hospitals/${editingId}` : "/api/hospitals";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save hospital branch.");
      }

      toast.success(
        editingId ? "Hospital branch updated successfully!" : "Hospital branch registered successfully!"
      );
      resetForm();
      setViewMode("list");
      await loadHospitals();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.code.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Header Banner & Actions                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#16324F]">Multi-Hospital Facility Network</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {hospitals.length} Branches
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Add multiple hospital facilities, configure doctor rosters, and manage multi-branch appointments.
            </p>
          </div>
        </div>

        {viewMode === "list" ? (
          <Button
            onClick={handleOpenCreate}
            className="bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-xs font-semibold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Hospital</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setViewMode("list");
            }}
            className="self-start sm:self-auto font-medium text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Hospital List</span>
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. Create / Edit Hospital Form                                            */}
      {/* ========================================================================= */}
      {viewMode !== "list" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h3 className="text-lg font-bold text-[#16324F]">
              {editingId ? "Edit Hospital Facility" : "Register New Hospital Branch"}
            </h3>
            <p className="text-xs text-[#64748B]">
              Provide branch identification, address, and specialty department capabilities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormError message={formError} />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#16324F]">
                  Hospital Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CareConnect Apollo Greams Road"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CC-AGR"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#16324F]">Facility Tagline</label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Multi-Specialty Tertiary Care Center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">License / Reg Number</label>
                <Input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. HOSP-MED-2026-X2"
                />
              </div>
            </div>

            {/* Contact & Hotlines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. branch@careconnect.health"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">
                  Emergency Phone <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +91 44 2800 1000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">Reception Landline</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 44 2800 1001"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#16324F]">Street Address</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 21 Greams Lane, Thousand Lights"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#16324F]">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                />
              </div>
            </div>

            {/* Departments Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#16324F] flex items-center justify-between">
                <span>Active Departments in this Facility</span>
                <span className="text-[11px] text-[#64748B] font-normal">
                  ({selectedDepts.length} selected)
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {AVAILABLE_DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDepts.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDept(dept)}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-teal-50 border-teal-500 text-teal-800 shadow-xs"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                      }`}
                    >
                      <span>{dept}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#16324F]">
                <input
                  type="checkbox"
                  checked={emergency24x7}
                  onChange={(e) => setEmergency24x7(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F766E] focus:ring-teal-500"
                />
                <span>24x7 Emergency Trauma Unit Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#16324F]">
                <input
                  type="checkbox"
                  checked={isMainBranch}
                  onChange={(e) => setIsMainBranch(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F766E] focus:ring-teal-500"
                />
                <span>Designate as Main Flagship Headquarters</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setViewMode("list");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingId ? "Update Hospital" : "Create Hospital Branch"}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Hospital Cards Grid View                                               */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital by branch name, code, or city..."
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading hospital facilities...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#16324F]">No Hospital Branches Found</h4>
              <p className="text-xs text-[#64748B] mt-1 mb-4">
                No hospital matches your search criteria or none registered yet.
              </p>
              <Button onClick={handleOpenCreate} className="bg-[#0F766E] text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add First Hospital
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHospitals.map((hosp) => (
                <div
                  key={hosp._id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Code & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#16324F] text-white text-xs font-mono font-bold tracking-wider">
                          {hosp.code}
                        </span>
                        {hosp.isMainBranch && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ★ Flagship
                          </span>
                        )}
                      </div>
                      <StatusBadge status={hosp.status} />
                    </div>

                    {/* Hospital Name & Tagline */}
                    <div>
                      <h4 className="text-base font-bold text-[#16324F] group-hover:text-[#0F766E] transition-colors leading-snug">
                        {hosp.name}
                      </h4>
                      {hosp.tagline && (
                        <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{hosp.tagline}</p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-[#64748B] pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {hosp.address?.street ? `${hosp.address.street}, ` : ""}
                          {hosp.address?.city || "Chennai"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-semibold text-rose-600">
                          Hotline: {hosp.emergencyPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hosp.contactEmail}</span>
                      </div>
                    </div>

                    {/* Department chips */}
                    <div className="pt-2 border-t border-[#F1F5F9]">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1.5 font-medium">
                        <span>Clinical Wings ({hosp.departments?.length || 0})</span>
                        <span className="font-bold text-[#0F766E] flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {hosp.doctorCount || 0} Doctors
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(hosp.departments || []).slice(0, 3).map((dept) => (
                          <span
                            key={dept}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                          >
                            {dept}
                          </span>
                        ))}
                        {(hosp.departments?.length || 0) > 3 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            +{hosp.departments.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(hosp)}
                      className="text-xs h-8 text-[#16324F] hover:bg-slate-50 font-medium"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit Details
                    </Button>

                    {onSelectHospitalBranch && (
                      <Button
                        size="sm"
                        onClick={() => onSelectHospitalBranch(hosp._id)}
                        className="bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs h-8 font-semibold"
                      >
                        <Stethoscope className="w-3.5 h-3.5 mr-1" />
                        View Doctors
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
