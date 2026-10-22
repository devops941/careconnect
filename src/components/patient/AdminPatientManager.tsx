"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Droplet,
  Calendar,
  Lock,
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Pencil,
  Trash2,
  ShieldAlert,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FormError } from "../auth/FormError";

export interface PatientRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bloodGroup?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  status: string;
  createdAt: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"];

export function AdminPatientManager() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");

  // Mode: "list" | "create" | "edit"
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("UNKNOWN");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [password, setPassword] = useState("Patient@123");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const url = search ? `/api/patients?search=${encodeURIComponent(search)}` : "/api/patients";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.data || []);
      }
    } catch {
      toast.error("Failed to load patient records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Patient full name is required.");
      return;
    }
    if (!email.trim()) {
      setFormError("Valid email address is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          bloodGroup,
          gender,
          dateOfBirth: dateOfBirth || undefined,
          password: password.trim() || "Patient@123",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to register patient");
      }

      toast.success(`Patient ${name} registered successfully!`);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setBloodGroup("UNKNOWN");
      setDateOfBirth("");
      setPassword("Patient@123");
      setMode("list");
      loadPatients();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (pt: PatientRecord) => {
    setEditId(pt._id);
    setName(pt.name);
    setEmail(pt.email);
    setPhone(pt.phone || "");
    setBloodGroup(pt.bloodGroup || "UNKNOWN");
    setGender(pt.gender || "MALE");
    if (pt.dateOfBirth) {
      const d = new Date(pt.dateOfBirth);
      setDateOfBirth(isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]);
    } else {
      setDateOfBirth("");
    }
    setStatus(pt.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE");
    setPassword("");
    setFormError(null);
    setMode("edit");
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!name.trim()) {
      setFormError("Patient full name is required.");
      return;
    }
    if (!email.trim()) {
      setFormError("Valid email address is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload: Record<string, any> = {
        id: editId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        bloodGroup,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        status,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update patient record.");
      }

      toast.success(`Patient record for "${name}" updated successfully!`);
      setMode("list");
      setEditId(null);
      loadPatients();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while updating patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async (id: string, patientName: string) => {
    if (!confirm(`Are you sure you want to remove patient "${patientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/patients?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Failed to delete patient.");
        return;
      }
      toast.success(`Patient "${patientName}" removed.`);
      if (mode === "edit") {
        setMode("list");
        setEditId(null);
      }
      loadPatients();
    } catch {
      toast.error("Failed to delete patient.");
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!bloodGroupFilter) return true;
    return p.bloodGroup === bloodGroupFilter;
  });

  // FULL-CARD EDIT VIEW
  if (mode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6 w-full animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setEditId(null);
                setFormError(null);
              }}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Patient Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#16324F]">Edit Patient Record</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                  {name}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Update clinical contact details, blood group, gender, account status, or credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeletePatient(editId, name)}
                className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Patient</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMode("list");
                setEditId(null);
                setFormError(null);
              }}
            >
              Cancel & Return
            </Button>
          </div>
        </div>

        <FormError message={formError} />

        <form onSubmit={handleUpdatePatient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arunachalam Pillai"
              required
            />

            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arunachalam@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98400 12345"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-[#1F2937]">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg === "UNKNOWN" ? "Unknown / Not Tested" : bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-[#1F2937]">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-[#1F2937]">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                <option value="ACTIVE">Active (Authorized for Clinic Appointments)</option>
                <option value="SUSPENDED">Suspended (Blocked from Clinic & Portal)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <Input
                label="Reset Password (Optional)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Enter new password only if patient requested a credential reset."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("list");
                setEditId(null);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="px-6 font-bold gap-2">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Patient..." : "Save Patient Changes"}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // FULL-CARD CREATE VIEW (NO OVERLAYS!)
  if (mode === "create") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setFormError(null);
              }}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Patient Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#16324F]">Register New Patient</h2>
              <p className="text-xs text-[#64748B]">
                Create a digital hospital record with personal credentials for patient portal login.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMode("list");
              setFormError(null);
            }}
          >
            Cancel & Return
          </Button>
        </div>

        <FormError message={formError} />

        <form onSubmit={handleCreatePatient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arunachalam Pillai"
              required
            />

            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arunachalam@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98400 12345"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-[#1F2937]">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg === "UNKNOWN" ? "Unknown / Not Tested" : bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-medium text-[#1F2937]">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <div className="md:col-span-2">
              <Input
                label="Portal Temporary Password *"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Patient@123"
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Patient can use this password along with their email to log in to the Patient Portal."
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("list");
                setFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="px-6 font-bold">
              {isSubmitting ? "Registering Patient..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // DEFAULT LIST VIEW
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shadow-xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
              Patient Management & Registry
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200">
                {filteredPatients.length} Registered
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Directory of hospital patients, contact details, medical records & new patient onboarding.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Blood group filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E]"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.filter((b) => b !== "UNKNOWN").map((bg) => (
              <option key={bg} value={bg}>
                Blood: {bg}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-60"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadPatients}
            title="Refresh List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setMode("create");
              setFormError(null);
            }}
            className="gap-2 font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </Button>
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="overflow-x-auto w-full">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading registered patient directory...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#16324F]">No Registered Patients Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              {search
                ? `No patients match your search query "${search}".`
                : "No patients have been registered yet. Click below to add the first patient."}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setMode("create");
                setFormError(null);
              }}
              className="gap-2 font-bold mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient</span>
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-[#64748B] bg-[#F8FAFC]">
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Contact Email</th>
                <th className="py-3 px-4 font-semibold">Phone Number</th>
                <th className="py-3 px-4 font-semibold">Blood Group</th>
                <th className="py-3 px-4 font-semibold">Gender</th>
                <th className="py-3 px-4 font-semibold">Registered Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredPatients.map((pt) => (
                <tr key={pt._id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#16324F]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] font-extrabold flex items-center justify-center shrink-0">
                        {pt.name.charAt(0)}
                      </div>
                      <div>
                        <span>{pt.name}</span>
                        {pt.dateOfBirth && (
                          <span className="block text-[10px] text-[#94A3B8] font-normal">
                            DOB: {new Date(pt.dateOfBirth).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{pt.email}</td>
                  <td className="py-3.5 px-4 text-[#475569]">{pt.phone || "—"}</td>
                  <td className="py-3.5 px-4">
                    {pt.bloodGroup && pt.bloodGroup !== "UNKNOWN" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <Droplet className="w-3 h-3 fill-red-500 text-red-500" />
                        {pt.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8] text-[11px]">Unknown</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569] font-medium">
                    {pt.gender || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {new Date(pt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {pt.status === "SUSPENDED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <ShieldAlert className="w-3 h-3" />
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(pt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-teal-50 hover:border-[#0F766E] text-xs font-semibold text-[#0F766E] transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                      title={`Edit details for ${pt.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Edit</span>
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
