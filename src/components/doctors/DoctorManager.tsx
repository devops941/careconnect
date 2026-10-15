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
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  opdRoomNo: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

interface DeptOption {
  _id: string;
  name: string;
  opdRoomNo?: string;
}

export function DoctorManager() {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");

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
  const [qualification, setQualification] = useState("MBBS, MD");
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(500);
  const [opdRoomNo, setOpdRoomNo] = useState("Room 201");
  const [status, setStatus] = useState<"ACTIVE" | "ON_LEAVE" | "INACTIVE">("ACTIVE");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docRes, deptRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/departments"),
      ]);
      const docData = await docRes.json();
      const deptData = await deptRes.json();

      if (docRes.ok && docData.success) setDoctors(docData.data || []);
      if (deptRes.ok && deptData.success) {
        setDepartments(deptData.data || []);
        if (deptData.data?.length > 0 && !departmentId) {
          setDepartmentId(deptData.data[0]._id);
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
    setStatus("ACTIVE");
    setFormError(null);
    setViewMode("create");
  };

  const openEditPage = (doc: DoctorItem) => {
    setEditingId(doc._id);
    setDoctorId(doc.doctorId);
    setPassword("");
    setShowPassword(false);
    setName(doc.name);
    setEmail(doc.email);
    setPhone(doc.phone || "");
    setGender(doc.gender || "MALE");
    setMedicalCouncilRegNo(doc.medicalCouncilRegNo || "");
    setSpecialization(doc.specialization);
    setDepartmentId(doc.departmentId);
    setQualification(doc.qualification);
    setExperienceYears(doc.experienceYears);
    setConsultationFee(doc.consultationFee);
    setOpdRoomNo(doc.opdRoomNo);
    setStatus(doc.status);
    setFormError(null);
    setViewMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialization.trim() || !email.trim()) {
      setFormError("Doctor Name, Official Email, and Specialization are required");
      return;
    }

    if (viewMode === "create" && (!password || password.length < 6)) {
      setFormError("Initial password must be at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingId ? `/api/doctors/${editingId}` : "/api/doctors";
      const method = editingId ? "PUT" : "POST";

      const payload: Record<string, any> = {
        doctorId: doctorId.trim() || `DOC-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        gender,
        medicalCouncilRegNo: medicalCouncilRegNo.trim() || undefined,
        specialization: specialization.trim(),
        departmentId,
        qualification: qualification.trim(),
        experienceYears: Number(experienceYears),
        consultationFee: Number(consultationFee),
        opdRoomNo: opdRoomNo.trim(),
        status,
      };

      if (viewMode === "create") {
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
        editingId
          ? "Doctor profile updated successfully"
          : `Doctor ${name} registered & login credentials provisioned!`
      );
      setViewMode("list");
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Error saving doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
      doc.doctorId.toLowerCase().includes(search.toLowerCase());

    const matchesDept = !selectedDeptFilter || doc.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // =========================================================================
  // VIEW MODE: CREATE OR EDIT DOCTOR FULL-PAGE (NO OVERLAY!)
  // =========================================================================
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Navigation Bar with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Doctors Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                {viewMode === "edit" ? "Edit Doctor Profile" : "Register Specialist Doctor"}
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure staff login credentials, specialization, fee, and consultation room.
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
            Cancel & Return to List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <FormError message={formError} />

          {/* Section 1: Staff Portal Login Credentials */}
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
                The doctor will use their <strong>Doctor ID</strong> or <strong>Official Email</strong> and this <strong>Password</strong> to sign in at the Hospital Staff Portal.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <Input
                  label="Login Username / Doctor ID *"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value.toUpperCase())}
                  placeholder="e.g. DOC-101"
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

          {/* Section 2: Personal & Contact Information */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
            <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2 uppercase tracking-wider border-b border-[#E2E8F0] pb-3">
              <User className="w-4 h-4 text-[#0F766E]" />
              <span>Personal & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="Doctor Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar"
                required
              />

              <Input
                label="Official Work Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.health"
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

              <div className="md:col-span-1 lg:col-span-2">
                <Input
                  label="Medical Council / State Registration No."
                  value={medicalCouncilRegNo}
                  onChange={(e) => setMedicalCouncilRegNo(e.target.value)}
                  placeholder="e.g. MCI-2022-84920 or TNMC-71924"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Specialization & OPD Practice */}
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
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ACTIVE">Active (Available for Appointments & Live Queue)</option>
                  <option value="ON_LEAVE">On Leave (Unavailable for Bookings)</option>
                  <option value="INACTIVE">Inactive (Disabled)</option>
                </select>
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
              isLoading={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-8 shadow-sm"
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
            <h2 className="text-lg font-bold text-[#16324F]">Doctor Management</h2>
            <p className="text-xs text-[#64748B]">
              Manage clinicians, specialization, room allocation, and staff login accounts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-48 sm:w-60 font-medium"
            />
          </div>

          <Button
            size="sm"
            onClick={openCreatePage}
            className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </Button>
        </div>
      </div>

      {/* Doctor Catalog Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">Loading registered doctors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#16324F]">No Doctors Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Click &quot;Add Doctor&quot; to onboard your hospital specialists and provision their login credentials.
            </p>
            <Button
              size="sm"
              onClick={openCreatePage}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold"
            >
              Add First Doctor
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Doctor ID</th>
                <th className="py-3 px-4">Name & Qualification</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">OPD Room</th>
                <th className="py-3 px-4">Fee (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    <span className="text-[11px] text-[#64748B]">{doc.qualification}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#16324F]">{doc.specialization}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold text-[11px]">
                      {doc.departmentName || "General OPD"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    <span className="block truncate max-w-[150px]">{doc.email}</span>
                    <span className="text-[11px]">{doc.phone || "-"}</span>
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
                    <button
                      onClick={() => openEditPage(doc)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 transition-colors"
                      title="Edit Doctor Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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
