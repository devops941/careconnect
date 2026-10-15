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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

export interface UnifiedStaffItem {
  _id: string;
  staffId: string; // DOC-101 / REC-101 / ADM-101
  name: string;
  email: string;
  role: "DOCTOR" | "RECEPTIONIST" | "ADMIN";
  department: string;
  departmentId?: string;
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
}

interface DeptOption {
  _id: string;
  name: string;
  opdRoomNo?: string;
}

interface StaffDoctorManagerProps {
  readOnly?: boolean;
}

export function StaffDoctorManager({ readOnly = false }: StaffDoctorManagerProps) {
  const [staffList, setStaffList] = useState<UnifiedStaffItem[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "DOCTOR" | "RECEPTIONIST" | "ADMIN">("ALL");

  // Page view mode: "list" | "create" | "edit" (Single card, no overlay!)
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [role, setRole] = useState<"DOCTOR" | "RECEPTIONIST" | "ADMIN">("DOCTOR");
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("CareConnect@123");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("General Medicine");
  const [status, setStatus] = useState<string>("ACTIVE");

  // Doctor-specific clinical states
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("MBBS, MD");
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(500);
  const [opdRoomNo, setOpdRoomNo] = useState("Room 101");
  const [medicalCouncilRegNo, setMedicalCouncilRegNo] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empRes, docRes, deptRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/doctors"),
        fetch("/api/departments"),
      ]);

      const empData = await empRes.json();
      const docData = await docRes.json();
      const deptData = await deptRes.json();

      const depts: DeptOption[] = deptRes.ok && deptData.success ? deptData.data || [] : [];
      setDepartments(depts);
      if (depts.length > 0 && !departmentId) {
        setDepartmentId(depts[0]._id);
        setDepartmentName(depts[0].name);
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
          phone: doc.phone,
          gender: doc.gender || "MALE",
          status: doc.status || "ACTIVE",
          specialization: doc.specialization,
          qualification: doc.qualification,
          experienceYears: doc.experienceYears,
          consultationFee: doc.consultationFee,
          opdRoomNo: doc.opdRoomNo,
          medicalCouncilRegNo: doc.medicalCouncilRegNo,
        });
      });

      // Index employees (receptionists, admins, non-synced doctors)
      rawEmployees.forEach((emp) => {
        const key = emp.email.toLowerCase();
        const existing = unifiedMap.get(key);
        if (existing) {
          // Keep doctor clinical info, ensure staffId is set
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
            opdRoomNo: emp.role === "RECEPTIONIST" ? "Front Desk" : "Admin Office",
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

  const generateStaffIdForRole = (selectedRole: "DOCTOR" | "RECEPTIONIST" | "ADMIN") => {
    const prefix = selectedRole === "DOCTOR" ? "DOC" : selectedRole === "RECEPTIONIST" ? "REC" : "ADM";
    return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
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
    setStatus(item.status);
    if (item.departmentId) {
      setDepartmentId(item.departmentId);
    }
    setDepartmentName(item.department);
    setFormError(null);
    setViewMode("edit");
  };

  const handleRoleChange = (newRole: "DOCTOR" | "RECEPTIONIST" | "ADMIN") => {
    setRole(newRole);
    if (!editingId) {
      setStaffId(generateStaffIdForRole(newRole));
    }
    if (newRole === "RECEPTIONIST") {
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
          qualification: qualification.trim(),
          experienceYears: Number(experienceYears),
          consultationFee: Number(consultationFee),
          opdRoomNo: opdRoomNo.trim(),
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
          ? `${name}'s profile updated successfully!`
          : `${role === "DOCTOR" ? "Doctor" : "Staff"} ${name} registered & login credentials provisioned!`
      );
      setViewMode("list");
      loadData();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter staff by search and role tab
  const filtered = staffList.filter((item) => {
    const matchesRole = roleFilter === "ALL" || item.role === roleFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.staffId.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      (item.specialization && item.specialization.toLowerCase().includes(search.toLowerCase())) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalDoctors = staffList.filter((s) => s.role === "DOCTOR").length;
  const totalReceptionists = staffList.filter((s) => s.role === "RECEPTIONIST").length;
  const totalAdmins = staffList.filter((s) => s.role === "ADMIN").length;
  const totalActive = staffList.filter((s) => s.status === "ACTIVE").length;

  // =========================================================================
  // VIEW MODE: CREATE OR EDIT STAFF / DOCTOR (FULL-PAGE SINGLE CARD, NO OVERLAY!)
  // =========================================================================
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6 w-full">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                {viewMode === "edit"
                  ? `Edit ${role === "DOCTOR" ? "Doctor Profile" : "Staff Member"}`
                  : "Register New Hospital Staff & Clinician"}
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure staff login credentials, clinical specialization, role, and department allocation.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode("list")}
            className="text-xs font-bold"
          >
            Cancel & Return to Directory
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <FormError message={formError} />

          {/* Section 1: Staff Role Selection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <label className="text-xs font-bold text-[#16324F] uppercase tracking-wider block">
              Step 1: Select Staff Role & Access Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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

              <p className="text-xs text-[#475569]">
                The employee will use their <strong>Login ID / Username</strong> or <strong>Official Email</strong> and this <strong>Password</strong> to sign in at the Hospital Staff Portal.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <Input
                  label={`Login Username / ${role === "DOCTOR" ? "Doctor ID" : "Employee ID"} *`}
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. DOC-101 / REC-101"
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">
                    Initial Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter login password"
                      className="w-full h-11 pl-3.5 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#16324F]"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Personal & Contact Information */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
            <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              <Users className="w-4 h-4 text-[#0F766E]" />
              <span>Personal & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="Full Legal Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar / Anandha Kumar"
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

          {/* Section 4: Clinical Specialization (If DOCTOR) or Department Assignment */}
          {role === "DOCTOR" ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
                <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                <span>Clinical Specialization & OPD Practice</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">Clinical Department *</label>
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

                <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1F2937]">Availability Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ACTIVE">Active (Available for Appointments & Live Queue)</option>
                    <option value="ON_LEAVE">On Leave (Temporarily Unavailable)</option>
                    <option value="INACTIVE">Inactive (Disabled)</option>
                  </select>
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
              isLoading={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-8 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {viewMode === "edit"
                  ? "Save Changes"
                  : `Provision ${role === "DOCTOR" ? "Doctor" : "Staff"} Account`}
              </span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: COMBINED DIRECTORY LIST TABLE
  // =========================================================================
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">Staff & Doctor Management</h2>
            <p className="text-xs text-[#64748B]">
              Unified directory for hospital clinicians, receptionists, and system administrators
            </p>
          </div>
        </div>

        {!readOnly && (
          <Button
            size="sm"
            onClick={openCreatePage}
            className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff / Doctor</span>
          </Button>
        )}
      </div>

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Total Personnel</span>
          <p className="text-xl font-extrabold text-[#16324F] mt-0.5">{staffList.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Specialist Doctors</span>
          <p className="text-xl font-extrabold text-blue-900 mt-0.5">{totalDoctors}</p>
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

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === "ALL"
                ? "bg-white text-[#16324F] shadow-xs"
                : "text-[#64748B] hover:text-[#16324F]"
            }`}
          >
            All Personnel ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("DOCTOR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              roleFilter === "DOCTOR"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-[#64748B] hover:text-[#16324F]"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors ({totalDoctors})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("RECEPTIONIST")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              roleFilter === "RECEPTIONIST"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-[#64748B] hover:text-[#16324F]"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Receptionists ({totalReceptionists})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              roleFilter === "ADMIN"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-[#64748B] hover:text-[#16324F]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admins ({totalAdmins})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-full md:w-72 font-medium"
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
              No staff members or doctors match your selected filter. Click &quot;Add Staff / Doctor&quot; to onboard.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name & Role</th>
                <th className="py-3 px-4">Department / Specialization</th>
                <th className="py-3 px-4">Room / Counter</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Consultation Fee</th>
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
                          : item.role === "RECEPTIONIST"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#16324F] block">{item.department}</span>
                    {item.specialization && (
                      <span className="text-[11px] text-[#64748B] block truncate max-w-[180px]">
                        {item.specialization}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#16324F]">
                    {item.opdRoomNo || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    <span className="block truncate max-w-[140px]">{item.email}</span>
                    <span className="text-[11px]">{item.phone || "-"}</span>
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
