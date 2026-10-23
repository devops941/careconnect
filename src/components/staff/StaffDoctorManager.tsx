"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Stethoscope,
  Plus,
  Edit,
  Search,
  CheckCircle2,
  Loader2,
  Shield,
  Phone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Building2,
  UserCheck,
  Briefcase,
  Layers,
  Clock,
  Calendar,
  MapPin,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

export interface UnifiedStaffItem {
  _id: string;
  staffId: string; // DOC-101 / REC-101 / ADM-101 / NUR-101
  name: string;
  email: string;
  role: "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "NURSE";
  department: string;
  departmentId?: string;
  hospitalId?: string;
  hospitalName?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  status: string;
  // Doctor-specific fields
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  opdRoomNo?: string;
  medicalCouncilRegNo?: string;
  availableDays?: string[];
  shiftHours?: {
    morningSlot?: string;
    eveningSlot?: string;
  };
  timeSlots?: string[];
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

interface StaffDoctorManagerProps {
  readOnly?: boolean;
}

export function StaffDoctorManager({ readOnly = false }: StaffDoctorManagerProps) {
  const [staffList, setStaffList] = useState<UnifiedStaffItem[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "ALL" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN"
  >("ALL");
  const [hospitalFilter, setHospitalFilter] = useState<string>("ALL");

  // Page view mode: "list" | "create" | "edit" (Single card, no overlay!)
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [role, setRole] = useState<"DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN">("DOCTOR");
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("CareConnect@123");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("General Medicine");
  const [formHospitalId, setFormHospitalId] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");

  // Doctor-specific clinical states
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("MBBS, MD");
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(500);
  const [opdRoomNo, setOpdRoomNo] = useState("Room 101");
  const [medicalCouncilRegNo, setMedicalCouncilRegNo] = useState("");
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

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empRes, docRes, deptRes, hospRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/doctors"),
        fetch("/api/departments"),
        fetch("/api/hospitals?status=ACTIVE"),
      ]);

      const empData = await empRes.json();
      const docData = await docRes.json();
      const deptData = await deptRes.json();
      const hospData = await hospRes.json();

      const depts: DeptOption[] = deptRes.ok && deptData.success ? deptData.data || [] : [];
      setDepartments(depts);
      if (depts.length > 0 && !departmentId) {
        setDepartmentId(depts[0]._id);
        setDepartmentName(depts[0].name);
      }

      const hospList: HospitalOption[] =
        hospRes.ok && hospData.success ? hospData.data || [] : [];
      setHospitals(hospList);
      if (hospList.length > 0 && !formHospitalId) {
        setFormHospitalId(hospList[0]._id);
      }

      // Merge employees and doctors into unified personnel directory
      const rawDoctors: any[] = docRes.ok && docData.success ? docData.data || [] : [];
      const rawEmployees: any[] = empRes.ok && empData.success ? empData.data || [] : [];

      const unifiedMap = new Map<string, UnifiedStaffItem>();

      // Index doctors first
      rawDoctors.forEach((doc) => {
        const key = doc.email.toLowerCase();
        unifiedMap.set(key, {
          _id: doc._id,
          staffId: doc.doctorId || "DOC",
          name: doc.name,
          email: doc.email,
          role: "DOCTOR",
          department: doc.departmentName || "General OPD",
          departmentId: doc.departmentId,
          hospitalId: doc.hospitalId,
          hospitalName: doc.hospitalName,
          phone: doc.phone,
          gender: doc.gender || "MALE",
          status: doc.status || "ACTIVE",
          specialization: doc.specialization,
          qualification: doc.qualification,
          experienceYears: doc.experienceYears,
          consultationFee: doc.consultationFee,
          opdRoomNo: doc.opdRoomNo,
          medicalCouncilRegNo: doc.medicalCouncilRegNo,
          availableDays: doc.availableDays || [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          shiftHours: doc.shiftHours,
          timeSlots: doc.timeSlots,
        });
      });

      // Index employees (receptionists, admins, non-synced doctors)
      rawEmployees.forEach((emp) => {
        const key = emp.email.toLowerCase();
        const existing = unifiedMap.get(key);
        if (existing) {
          existing.staffId = existing.staffId || emp.employeeId;
        } else {
          unifiedMap.set(key, {
            _id: emp._id,
            staffId: emp.employeeId,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            department: emp.department || "Administration",
            phone: emp.phone,
            status: emp.status || "ACTIVE",
            opdRoomNo:
              emp.role === "RECEPTIONIST"
                ? "Front Desk"
                : emp.role === "NURSE"
                ? "Nurse Station"
                : "Admin Office",
          });
        }
      });

      setStaffList(Array.from(unifiedMap.values()));
    } catch (err) {
      console.error("Failed to load staff & doctor directory", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check localStorage initial hospital
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("careconnect_selected_hospital");
      if (saved) setHospitalFilter(saved);
    }

    // Listen for top bar switcher changes
    const handleHospChange = (e: any) => {
      const hId = e.detail?.hospitalId;
      if (hId) {
        setHospitalFilter(hId);
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

  const generateStaffIdForRole = (
    selectedRole: "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN"
  ) => {
    const num = Math.floor(100 + Math.random() * 900);
    if (selectedRole === "DOCTOR") return `DOC-${num}`;
    if (selectedRole === "NURSE") return `NUR-${num}`;
    if (selectedRole === "RECEPTIONIST") return `REC-${num}`;
    return `ADM-${num}`;
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
    setRole("DOCTOR");
    setStaffId(generateStaffIdForRole("DOCTOR"));
    setName("");
    setEmail("");
    setPassword("CareConnect@123");
    setShowPassword(false);
    setPhone("");
    setGender("MALE");
    setSpecialization("");
    setQualification("MBBS, MD");
    setExperienceYears(5);
    setConsultationFee(500);
    setOpdRoomNo(departments[0]?.opdRoomNo || "Room 101");
    setMedicalCouncilRegNo("");
    setAvailableDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    setMorningSlot("09:00 AM - 01:00 PM");
    setEveningSlot("05:00 PM - 08:00 PM");
    if (hospitals.length > 0) setFormHospitalId(hospitals[0]._id);
    setStatus("ACTIVE");
    setFormError(null);
    setViewMode("create");
  };

  const openEditPage = (item: UnifiedStaffItem) => {
    setEditingId(item._id);
    setRole(item.role);
    setStaffId(item.staffId);
    setName(item.name);
    setEmail(item.email);
    setPassword("********");
    setShowPassword(false);
    setPhone(item.phone || "");
    setGender(item.gender || "MALE");
    setSpecialization(item.specialization || "");
    setQualification(item.qualification || "MBBS, MD");
    setExperienceYears(item.experienceYears || 5);
    setConsultationFee(item.consultationFee || 500);
    setOpdRoomNo(item.opdRoomNo || "Room 101");
    setMedicalCouncilRegNo(item.medicalCouncilRegNo || "");
    setAvailableDays(
      item.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    );
    setMorningSlot(item.shiftHours?.morningSlot || "09:00 AM - 01:00 PM");
    setEveningSlot(item.shiftHours?.eveningSlot || "05:00 PM - 08:00 PM");
    if (item.hospitalId) setFormHospitalId(item.hospitalId);
    setStatus(item.status);
    if (item.departmentId) {
      setDepartmentId(item.departmentId);
    }
    setDepartmentName(item.department);
    setFormError(null);
    setViewMode("edit");
  };

  const handleRoleChange = (newRole: "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN") => {
    setRole(newRole);
    if (!editingId) {
      setStaffId(generateStaffIdForRole(newRole));
    }
    if (newRole === "NURSE") {
      setDepartmentName("OPD Triage / Vitals Station");
      setOpdRoomNo("Nurse Station 1");
    } else if (newRole === "RECEPTIONIST") {
      setDepartmentName("Front Desk / Triage");
      setOpdRoomNo("Front Reception Counter");
    } else if (newRole === "ADMIN") {
      setDepartmentName("Hospital Administration");
      setOpdRoomNo("Administration Suite");
    } else if (departments.length > 0) {
      setDepartmentName(departments[0].name);
      setOpdRoomNo(departments[0].opdRoomNo || "Room 101");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Full Name is required");
      return;
    }
    if (!email.trim()) {
      setFormError("Official work email is required");
      return;
    }
    if (role === "DOCTOR" && !specialization.trim()) {
      setFormError("Doctor clinical specialization is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (role === "DOCTOR") {
        const url = editingId ? `/api/doctors/${editingId}` : "/api/doctors";
        const method = editingId ? "PUT" : "POST";
        const payload: Record<string, any> = {
          doctorId: staffId.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          gender,
          medicalCouncilRegNo: medicalCouncilRegNo.trim() || undefined,
          specialization: specialization.trim(),
          departmentId: departmentId || departments[0]?._id,
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
          status: status as any,
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
      } else {
        // Receptionist or Admin
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: staffId.trim(),
            name: name.trim(),
            email: email.trim(),
            role,
            department: departmentName.trim(),
            password,
            phone: phone.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to provision employee");
        }
      }

      toast.success(
        editingId
          ? `${name} updated successfully!`
          : `${role} account created successfully!`
      );
      setViewMode("list");
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save staff record");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered staff list
  const filtered = staffList.filter((item) => {
    // 1. Role filter
    if (roleFilter !== "ALL" && item.role !== roleFilter) return false;

    // 2. Hospital filter: if hospital selected, filter doctors
    if (
      hospitalFilter !== "ALL" &&
      item.role === "DOCTOR" &&
      item.hospitalId &&
      item.hospitalId !== hospitalFilter
    ) {
      return false;
    }

    // 3. Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.staffId.toLowerCase().includes(q);
      const matchDept = item.department.toLowerCase().includes(q);
      const matchSpec = item.specialization?.toLowerCase().includes(q);
      const matchHosp = item.hospitalName?.toLowerCase().includes(q);
      return matchName || matchId || matchDept || matchSpec || matchHosp;
    }

    return true;
  });

  const totalDoctors = staffList.filter((s) => s.role === "DOCTOR").length;
  const totalNurses = staffList.filter((s) => s.role === "NURSE").length;
  const totalReceptionists = staffList.filter((s) => s.role === "RECEPTIONIST").length;
  const totalAdmins = staffList.filter((s) => s.role === "ADMIN").length;

  // Selected hospital name for label
  const activeHospital = hospitals.find((h) => h._id === hospitalFilter);

  // =========================================================================
  // VIEW 1: CREATE OR EDIT SINGLE FORM VIEW
  // =========================================================================
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                setEditingId(null);
              }}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#16324F] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#16324F]">
                {viewMode === "edit" ? `Edit Staff Member — ${name}` : "Onboard New Staff or Doctor"}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {viewMode === "edit"
                  ? "Update staff credentials, branch assignment, duty schedule, and clinical details."
                  : "Provision staff login, assign hospital facility branch, and configure consultation rosters."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setViewMode("list");
              setEditingId(null);
            }}
            className="text-xs font-semibold"
          >
            Cancel & Back
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <FormError message={formError} />

          {/* Section 1: Staff Role Selection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <label className="text-xs font-bold text-[#16324F] uppercase tracking-wider block">
              Step 1: Select Staff Role & Access Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleRoleChange("DOCTOR")}
                disabled={viewMode === "edit"}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === "DOCTOR"
                    ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === "DOCTOR" ? "bg-[#0F766E] text-white" : "bg-slate-100 text-[#64748B]"
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#16324F]">Doctor / Specialist</h4>
                  <p className="text-[11px] text-[#64748B]">OPD Desk & Clinical Rx Pad</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("NURSE")}
                disabled={viewMode === "edit"}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === "NURSE"
                    ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === "NURSE" ? "bg-[#0F766E] text-white" : "bg-slate-100 text-[#64748B]"
                  }`}
                >
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#16324F]">Staff Nurse</h4>
                  <p className="text-[11px] text-[#64748B]">OPD Vitals & Pre-Consultation</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("RECEPTIONIST")}
                disabled={viewMode === "edit"}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === "RECEPTIONIST"
                    ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === "RECEPTIONIST" ? "bg-[#0F766E] text-white" : "bg-slate-100 text-[#64748B]"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#16324F]">Receptionist</h4>
                  <p className="text-[11px] text-[#64748B]">Front Desk & Token Triage</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("ADMIN")}
                disabled={viewMode === "edit"}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === "ADMIN"
                    ? "bg-white border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs"
                    : "bg-white/60 border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    role === "ADMIN" ? "bg-[#0F766E] text-white" : "bg-slate-100 text-[#64748B]"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#16324F]">Administrator</h4>
                  <p className="text-[11px] text-[#64748B]">Full Hospital Operations</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Staff Portal Login Credentials */}
          {viewMode === "create" && (
            <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-[#0F766E]" />
                  <h3 className="text-sm font-bold text-[#0F766E] uppercase tracking-wider">
                    Staff Portal Login Credentials
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1.5 w-fit"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Generate Password</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Generated Staff ID *"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="DOC-101"
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">
                    Temporary Staff Password *
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

          {/* Section 3: Profile Information */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
            <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              <UserCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Personal & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="Full Official Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Kumar"
                required
              />

              <Input
                label="Official Work Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@careconnect.health"
                disabled={viewMode === "edit"}
                required
              />

              <Input
                label="Mobile Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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

              {role === "DOCTOR" && (
                <div className="md:col-span-1 lg:col-span-2">
                  <Input
                    label="Medical Council / State Registration No."
                    value={medicalCouncilRegNo}
                    onChange={(e) => setMedicalCouncilRegNo(e.target.value)}
                    placeholder="e.g. MCI-2022-84920 or TNMC-71924"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Hospital Branch & Clinical Practice (If DOCTOR) */}
          {role === "DOCTOR" ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                <span>Hospital Facility Branch & Clinical OPD</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Hospital Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">
                    Assigned Hospital Facility Branch *
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
                    onChange={(e) => {
                      setDepartmentId(e.target.value);
                      const selected = departments.find((d) => d._id === e.target.value);
                      if (selected) {
                        setDepartmentName(selected.name);
                        if (selected.opdRoomNo) setOpdRoomNo(selected.opdRoomNo);
                      }
                    }}
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
                  label="Clinical Specialization *"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Senior Interventional Cardiologist"
                  required
                />

                <Input
                  label="Academic Qualifications"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. MBBS, MD, DM (Cardiology)"
                />

                <Input
                  label="Clinical Experience (Years)"
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
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ACTIVE">Active (Available for Appointments)</option>
                    <option value="ON_LEAVE">On Leave (Temporarily Unavailable)</option>
                    <option value="INACTIVE">Inactive (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Section 4B: DOCTOR DUTY ROSTER & AVAILABLE TIMINGS */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0F766E]" />
                  <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                    Doctor Availability Schedule & Working Hours
                  </h4>
                </div>

                {/* Available Days Picker */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                <span>Department & Operational Assignment</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Assigned Hospital Department *"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Front Desk / Central Triage"
                  required
                />

                <Input
                  label="Desk / Office Location"
                  value={opdRoomNo}
                  onChange={(e) => setOpdRoomNo(e.target.value)}
                  placeholder="e.g. Counter 1 (Main Lobby)"
                />

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ACTIVE">Active (Can Log in and Operate)</option>
                    <option value="INACTIVE">Inactive (Access Suspended)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setViewMode("list");
                setEditingId(null);
              }}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs shadow-sm px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{viewMode === "edit" ? "Save Changes" : `Create ${role}`}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PERSONNEL DIRECTORY LIST VIEW
  // =========================================================================
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#16324F]">Staff & Doctor Directory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {filtered.length} Personnel
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Facility-scoped medical specialists, clinic duty rosters, and frontline triage personnel.
          </p>
        </div>

        {!readOnly && (
          <Button
            onClick={openCreatePage}
            className="bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-xs font-semibold self-start sm:self-auto text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Staff / Doctor</span>
          </Button>
        )}
      </div>

      {/* Filter Row: Hospital Filter & Role Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
        {/* Left: Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === r
                  ? "bg-[#16324F] text-white shadow-2xs"
                  : "bg-white text-[#64748B] hover:text-[#16324F] border border-[#E2E8F0]"
              }`}
            >
              {r === "ALL" ? "All Roles" : r === "NURSE" ? "Nurses" : r}
            </button>
          ))}
        </div>

        {/* Right: Hospital Facility Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span className="text-xs font-bold text-[#16324F] whitespace-nowrap">Hospital Facility:</span>
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#16324F] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Hospital Facilities ({staffList.length})</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Total Personnel</span>
          <p className="text-xl font-extrabold text-[#16324F] mt-0.5">{staffList.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Specialist Doctors</span>
          <p className="text-xl font-extrabold text-blue-900 mt-0.5">{totalDoctors}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/70">
          <span className="text-[11px] font-bold text-teal-700 uppercase">OPD Nurses</span>
          <p className="text-xl font-extrabold text-teal-900 mt-0.5">{totalNurses}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Front Desk Staff</span>
          <p className="text-xl font-extrabold text-amber-900 mt-0.5">{totalReceptionists}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70">
          <span className="text-[11px] font-bold text-purple-700 uppercase">Hospital Admins</span>
          <p className="text-xl font-extrabold text-purple-900 mt-0.5">{totalAdmins}</p>
        </div>
      </div>

      {/* Directory Search & Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs font-semibold text-[#64748B]">
          Showing <span className="font-bold text-[#16324F]">{filtered.length}</span> of{" "}
          {staffList.length} members
          {hospitalFilter !== "ALL" && activeHospital && (
            <span className="ml-1 text-[#0F766E] font-bold">
              • at {activeHospital.name}
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, hospital, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-full sm:w-80 font-medium"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading personnel directory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#16324F]">No Personnel Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              No staff members or doctors match your selected hospital or role filter.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name & Role</th>
                <th className="py-3 px-4">Hospital Facility</th>
                <th className="py-3 px-4">Department / Availability</th>
                <th className="py-3 px-4">Room / Counter</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
                {!readOnly && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                    {item.staffId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#16324F] block">{item.name}</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border mt-0.5 ${
                        item.role === "DOCTOR"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.role === "NURSE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.role === "RECEPTIONIST"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {item.role === "NURSE" ? "Staff Nurse" : item.role}
                    </span>
                  </td>

                  {/* Hospital Facility */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#16324F] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {item.hospitalName || "CareConnect Main"}
                      </span>
                    </div>
                  </td>

                  {/* Department & Availability Timing */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#16324F] block">{item.department}</span>
                    {item.role === "DOCTOR" ? (
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {item.availableDays?.slice(0, 3).map((d) => d.slice(0, 3)).join(", ")}
                          {(item.availableDays?.length || 0) > 3 && ` +${item.availableDays!.length - 3}`}
                          {" • "}
                          {item.shiftHours?.morningSlot || "09:00 AM - 01:00 PM"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#64748B] block truncate max-w-[150px]">
                        Full-time Operational
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#16324F]">
                    {item.opdRoomNo || "-"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0F766E]">
                    {item.role === "DOCTOR" ? `₹${item.consultationFee || 500}` : "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={item.status}
                      labelMap={{
                        ACTIVE: "Active",
                        ON_LEAVE: "On Leave",
                        INACTIVE: "Inactive",
                      }}
                    />
                  </td>
                  {!readOnly && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditPage(item)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
