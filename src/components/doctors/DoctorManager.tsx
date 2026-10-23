"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Plus,
  Edit,
  CheckCircle2,
  Loader2,
  Search,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  User,
  Building2,
  FileBadge,
  ArrowLeft,
  CalendarCheck2,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

interface DoctorItem {
  _id: string;
  doctorId: string;
  name: string;
  email: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  medicalCouncilRegNo?: string;
  specialization: string;
  departmentId: string;
  departmentName?: string;
  hospitalId?: string;
  hospitalName?: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  opdRoomNo: string;
  availableDays?: string[];
  shiftHours?: {
    morningSlot?: string;
    eveningSlot?: string;
  };
  timeSlots?: string[];
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

interface DeptOption {
  _id: string;
  name: string;
  opdRoomNo?: string;
}

interface HospitalOption {
  _id: string;
  name: string;
  code: string;
}

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DoctorManagerProps {
  readOnly?: boolean;
  onBookAppointment?: (doctorId: string) => void;
}

export function DoctorManager({ readOnly = false, onBookAppointment }: DoctorManagerProps = {}) {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>("ALL");

  // Page view mode: "list" | "create" | "edit" (No overlay!)
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("Doctor@123");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [medicalCouncilRegNo, setMedicalCouncilRegNo] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formHospitalId, setFormHospitalId] = useState("");
  const [qualification, setQualification] = useState("MBBS, MD");
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(500);
  const [opdRoomNo, setOpdRoomNo] = useState("Room 201");
  const [availableDays, setAvailableDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);
  const [morningSlot, setMorningSlot] = useState("09:00 AM - 01:00 PM");
  const [eveningSlot, setEveningSlot] = useState("05:00 PM - 08:00 PM");
  const [status, setStatus] = useState<"ACTIVE" | "ON_LEAVE" | "INACTIVE">("ACTIVE");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docRes, deptRes, hospRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/departments"),
        fetch("/api/hospitals?status=ACTIVE"),
      ]);
      const docData = await docRes.json();
      const deptData = await deptRes.json();
      const hospData = await hospRes.json();

      if (docRes.ok && docData.success) setDoctors(docData.data || []);
      if (deptRes.ok && deptData.success) {
        setDepartments(deptData.data || []);
        if (deptData.data?.length > 0 && !departmentId) {
          setDepartmentId(deptData.data[0]._id);
        }
      }
      if (hospRes.ok && hospData.success) {
        const hospList: HospitalOption[] = hospData.data || [];
        setHospitals(hospList);
        if (hospList.length > 0 && !formHospitalId) {
          setFormHospitalId(hospList[0]._id);
        }
      }
    } catch {
      console.error("Failed to load doctor data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("careconnect_selected_hospital");
      if (saved) setSelectedHospitalFilter(saved);
    }

    const handleHospChange = (e: any) => {
      const hId = e.detail?.hospitalId;
      if (hId) {
        setSelectedHospitalFilter(hId);
      }
    };
    window.addEventListener("hospital-selection-change", handleHospChange);
    return () => window.removeEventListener("hospital-selection-change", handleHospChange);
  }, []);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setShowPassword(true);
    toast.success("Generated random secure password");
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length === 1) {
        toast.warning("Doctor must be available on at least one day.");
        return;
      }
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const openCreatePage = () => {
    setEditingId(null);
    const randomId = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    setDoctorId(randomId);
    setPassword("Doctor@123");
    setShowPassword(false);
    setName("");
    setEmail("");
    setPhone("");
    setGender("MALE");
    setMedicalCouncilRegNo("");
    setSpecialization("");
    setQualification("MBBS, MD");
    setExperienceYears(5);
    setConsultationFee(500);
    setOpdRoomNo("Room 201");
    setAvailableDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    setMorningSlot("09:00 AM - 01:00 PM");
    setEveningSlot("05:00 PM - 08:00 PM");
    if (hospitals.length > 0) setFormHospitalId(hospitals[0]._id);
    setStatus("ACTIVE");
    setFormError(null);
    setViewMode("create");
  };

  const openEditPage = (doc: DoctorItem) => {
    setEditingId(doc._id);
    setDoctorId(doc.doctorId);
    setName(doc.name);
    setEmail(doc.email);
    setPhone(doc.phone || "");
    setGender(doc.gender || "MALE");
    setMedicalCouncilRegNo(doc.medicalCouncilRegNo || "");
    setSpecialization(doc.specialization);
    setDepartmentId(doc.departmentId);
    if (doc.hospitalId) setFormHospitalId(doc.hospitalId);
    setQualification(doc.qualification);
    setExperienceYears(doc.experienceYears);
    setConsultationFee(doc.consultationFee);
    setOpdRoomNo(doc.opdRoomNo);
    setAvailableDays(
      doc.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    );
    setMorningSlot(doc.shiftHours?.morningSlot || "09:00 AM - 01:00 PM");
    setEveningSlot(doc.shiftHours?.eveningSlot || "05:00 PM - 08:00 PM");
    setStatus(doc.status);
    setFormError(null);
    setViewMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !specialization.trim() || !departmentId) {
      setFormError("All required fields must be filled");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingId ? `/api/doctors/${editingId}` : "/api/doctors";
      const method = editingId ? "PUT" : "POST";

      const payload: Record<string, any> = {
        doctorId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        gender,
        medicalCouncilRegNo: medicalCouncilRegNo.trim() || undefined,
        specialization: specialization.trim(),
        departmentId,
        hospitalId: formHospitalId || hospitals[0]?._id,
        qualification: qualification.trim(),
        experienceYears: Number(experienceYears),
        consultationFee: Number(consultationFee),
        opdRoomNo: opdRoomNo.trim(),
        availableDays,
        shiftHours: {
          morningSlot,
          eveningSlot,
        },
        status,
      };

      if (!editingId) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save doctor");
      }

      toast.success(
        editingId ? "Doctor profile updated successfully!" : "Doctor registered and provisioned!"
      );
      setViewMode("list");
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = doctors.filter((doc) => {
    // 1. Department filter
    if (selectedDeptFilter && doc.departmentId !== selectedDeptFilter) return false;

    // 2. Hospital filter
    if (
      selectedHospitalFilter !== "ALL" &&
      doc.hospitalId &&
      doc.hospitalId !== selectedHospitalFilter
    ) {
      return false;
    }

    // 3. Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchId = doc.doctorId.toLowerCase().includes(q);
      const matchSpec = doc.specialization.toLowerCase().includes(q);
      const matchDept = doc.departmentName?.toLowerCase().includes(q);
      const matchHosp = doc.hospitalName?.toLowerCase().includes(q);
      return matchName || matchId || matchSpec || matchDept || matchHosp;
    }

    return true;
  });

  const activeHospital = hospitals.find((h) => h._id === selectedHospitalFilter);

  // =========================================================================
  // VIEW MODE: CREATE OR EDIT FORM VIEW
  // =========================================================================
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#16324F] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#16324F]">
                {viewMode === "edit" ? `Edit Doctor — ${name}` : "Register New Specialist Doctor"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {viewMode === "edit"
                  ? "Update clinician details, branch hospital, consultation timing, and OPD schedule."
                  : "Provision staff login account, hospital wing assignment, and consultation fee structure."}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setViewMode("list")}>
            Back to Directory
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormError message={formError} />

          {/* Login Credentials Box (only on Create) */}
          {viewMode === "create" && (
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0F766E]" />
                  <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                    Staff Portal Login Account
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Generate Password</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Generated Doctor ID *"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="DOC-101"
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">
                    Temporary Login Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Doctor@123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#16324F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Professional Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <User className="w-4 h-4 text-[#0F766E]" />
              <span>Doctor Profile & Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Doctor Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Anand Swaminathan"
                required
              />

              <Input
                label="Official Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@careconnect.health"
                disabled={viewMode === "edit"}
                required
              />

              <Input
                label="Direct Phone / Extension"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="Medical Council Reg. No"
                value={medicalCouncilRegNo}
                onChange={(e) => setMedicalCouncilRegNo(e.target.value)}
                placeholder="MCI-2022-84920"
              />
            </div>
          </div>

          {/* Section 2: Hospital Branch & Clinical Practice */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
              <Building2 className="w-4 h-4 text-[#0F766E]" />
              <span>Hospital Facility & OPD Consultation Practice</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Hospital Branch Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">
                  Assigned Hospital Branch *
                </label>
                <select
                  value={formHospitalId}
                  onChange={(e) => setFormHospitalId(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">
                  Clinical Department *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Specialization *"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Senior Cardiologist"
                required
              />

              <Input
                label="Qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="MBBS, MD, DM"
              />

              <Input
                label="Experience (Years)"
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                placeholder="5"
              />

              <Input
                label="Consultation Fee (₹)"
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                placeholder="500"
              />

              <Input
                label="OPD Consultation Room"
                value={opdRoomNo}
                onChange={(e) => setOpdRoomNo(e.target.value)}
                placeholder="Room 204"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">
                  Availability Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ACTIVE">Active (Available for Bookings)</option>
                  <option value="ON_LEAVE">On Leave (Temporarily Unavailable)</option>
                  <option value="INACTIVE">Inactive (Disabled)</option>
                </select>
              </div>
            </div>

            {/* Doctor Availability Schedule Roster */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                  Doctor Availability Roster & Timings
                </h4>
              </div>

              {/* Day Pills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F2937] block">
                  Available Working Days ({availableDays.length} days active)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const isActive = availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isActive
                            ? "bg-teal-50 border-teal-500 text-teal-800 shadow-2xs"
                            : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                        }`}
                      >
                        {day.slice(0, 3)}
                        {isActive && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shift Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Morning Consultation Hours"
                  value={morningSlot}
                  onChange={(e) => setMorningSlot(e.target.value)}
                  placeholder="09:00 AM - 01:00 PM"
                />
                <Input
                  label="Evening Consultation Hours"
                  value={eveningSlot}
                  onChange={(e) => setEveningSlot(e.target.value)}
                  placeholder="05:00 PM - 08:00 PM"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setViewMode("list")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-8 shadow-sm text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{viewMode === "edit" ? "Save Doctor Changes" : "Register & Provision Doctor"}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: DOCTORS DIRECTORY LIST TABLE
  // =========================================================================
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">
              {readOnly ? "Specialists & Doctors Directory" : "Doctor Management"}
            </h2>
            <p className="text-xs text-[#64748B]">
              {readOnly
                ? "Browse certified specialists, facility locations, and consultation timings"
                : "Manage clinicians, multi-branch hospital assignments, and available working hours"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hospital Filter Dropdown */}
          <select
            value={selectedHospitalFilter}
            onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] font-medium"
          >
            <option value="ALL">All Hospital Facilities</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctors, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-44 sm:w-56 font-medium"
            />
          </div>

          {!readOnly && (
            <Button
              size="sm"
              onClick={openCreatePage}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5 shadow-sm text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Doctor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Notice Banner if Hospital filter is active */}
      {selectedHospitalFilter !== "ALL" && activeHospital && (
        <div className="px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F766E]" />
            <span>
              Showing doctors consulting at <strong>{activeHospital.name}</strong> ({activeHospital.code})
            </span>
          </div>
          <button
            onClick={() => setSelectedHospitalFilter("ALL")}
            className="text-[11px] font-bold text-teal-700 hover:underline"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Doctor Catalog Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">Loading registered doctors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#16324F]">No Doctors Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              {readOnly
                ? "No specialists match your selected hospital or department filter."
                : "Click \"Add Doctor\" to onboard specialists for this hospital branch."}
            </p>
            {!readOnly && (
              <Button
                size="sm"
                onClick={openCreatePage}
                className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold text-white"
              >
                Add First Doctor
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Doctor ID</th>
                <th className="py-3 px-4">Name & Specialization</th>
                <th className="py-3 px-4">Hospital Facility</th>
                <th className="py-3 px-4">Available Days & Timings</th>
                <th className="py-3 px-4">OPD Room</th>
                <th className="py-3 px-4">Fee (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">{readOnly ? "Consultation" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((doc) => (
                <tr key={doc._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                    {doc.doctorId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#16324F] block">{doc.name}</span>
                    <span className="text-[11px] text-[#64748B] block">{doc.specialization} • {doc.qualification}</span>
                  </td>

                  {/* Hospital Facility */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#16324F] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {doc.hospitalName || "CareConnect Main"}
                      </span>
                    </div>
                  </td>

                  {/* Available Days & Timings */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block">
                        {doc.availableDays?.slice(0, 3).map((d) => d.slice(0, 3)).join(", ")}
                        {(doc.availableDays?.length || 0) > 3 && ` +${doc.availableDays!.length - 3}`}
                      </span>
                      <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{doc.shiftHours?.morningSlot || "09:00 AM - 01:00 PM"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#16324F]">{doc.opdRoomNo}</td>
                  <td className="py-3.5 px-4 font-bold text-[#0F766E]">₹{doc.consultationFee}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={doc.status}
                      labelMap={{
                        ACTIVE: "Active",
                        ON_LEAVE: "On Leave",
                        INACTIVE: "Inactive",
                      }}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {readOnly ? (
                      <Button
                        size="sm"
                        onClick={() => onBookAppointment?.(doc._id)}
                        className="h-7 text-[11px] px-2.5 bg-[#0F766E] hover:bg-[#115E59] font-bold gap-1 shadow-2xs text-white"
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5" />
                        <span>Book Visit</span>
                      </Button>
                    ) : (
                      <button
                        onClick={() => openEditPage(doc)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
                        title="Edit Doctor Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
