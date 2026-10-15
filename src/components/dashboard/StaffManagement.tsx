"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Stethoscope,
  CheckCircle2,
  Loader2,
  Phone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { FormError } from "../auth/FormError";

interface EmployeeItem {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "DOCTOR" | "RECEPTIONIST" | "ADMIN";
  department: string;
  phone?: string;
  status: string;
  createdAt: string;
}

export function StaffManagement() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"DOCTOR" | "RECEPTIONIST" | "ADMIN">("DOCTOR");
  const [department, setDepartment] = useState("General Medicine");
  const [password, setPassword] = useState("Staff@123");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  const loadEmployees = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(data.data || []);
      }
    } catch {
      console.error("Failed to load employees");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadEmployees();
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

  const openDrawer = () => {
    setEmployeeId(
      role === "DOCTOR"
        ? `DOC-${Math.floor(100 + Math.random() * 900)}`
        : role === "RECEPTIONIST"
        ? `REC-${Math.floor(100 + Math.random() * 900)}`
        : `ADM-${Math.floor(100 + Math.random() * 900)}`
    );
    setName("");
    setEmail("");
    setPassword("Staff@123");
    setShowPassword(false);
    setPhone("");
    setFormError(null);
    setShowAddForm(true);
  };

  const handleRoleChange = (newRole: "DOCTOR" | "RECEPTIONIST" | "ADMIN") => {
    setRole(newRole);
    setEmployeeId(
      newRole === "DOCTOR"
        ? `DOC-${Math.floor(100 + Math.random() * 900)}`
        : newRole === "RECEPTIONIST"
        ? `REC-${Math.floor(100 + Math.random() * 900)}`
        : `ADM-${Math.floor(100 + Math.random() * 900)}`
    );
    if (newRole === "RECEPTIONIST") {
      setDepartment("Front Desk / Triage");
    } else if (newRole === "ADMIN") {
      setDepartment("Hospital Administration");
    } else {
      setDepartment("General Medicine");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim() || !email.trim() || !password) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId.trim().toUpperCase(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to provision staff account.");
      }

      toast.success(
        `Staff account created! Employee ID: ${data.data.employeeId}. They can now log in.`
      );
      setShowAddForm(false);
      loadEmployees();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FULL-PAGE VIEW: Create / Provision Staff Member (NO OVERLAY!)
  if (showAddForm) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Header with Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Staff Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                Provision Hospital Staff Account
              </h2>
              <p className="text-xs text-[#64748B]">
                Create employee login credentials, role assignments, and department mapping.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(false)}
            className="text-xs font-bold"
          >
            Cancel & Return to List
          </Button>
        </div>

        <form onSubmit={handleCreate} className="space-y-6 w-full">
          <FormError message={formError} />

          {/* Section 1: Staff Portal Login Credentials */}
          <div className="p-5 sm:p-6 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-3">
              <div className="flex items-center gap-2">
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
              The staff member will use their <strong>Employee ID</strong> or <strong>Official Email</strong> and this <strong>Password</strong> to sign in at the Hospital Staff Portal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <Input
                label="Employee ID / Login Username *"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. DOC-101 / REC-201"
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

          {/* Section 2: Role & Department */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Role & Department Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Staff Role *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="DOCTOR">Doctor (Clinician Desk)</option>
                  <option value="RECEPTIONIST">Receptionist (Front Desk & Queue)</option>
                  <option value="ADMIN">Hospital Administrator</option>
                </select>
              </div>

              <Input
                label="Assigned Clinical Department *"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology / Front Desk"
                required
              />
            </div>
          </div>

          {/* Section 3: Personal & Contact Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-sm font-bold text-[#16324F] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Full Legal Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins / Anandha Kumar"
                required
              />

              <Input
                label="Official Work Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@careconnect.health"
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Provision Staff Account</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">Hospital Staff Provisioning</h2>
            <p className="text-xs text-[#64748B]">
              Provision credentials for Doctors, Receptionists, and Administrators
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={openDrawer}
          className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </Button>
      </div>

      {/* Staff Table / List */}
      <div className="overflow-x-auto">
        {isLoadingList ? (
          <div className="text-center py-8 text-sm text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading staff directory...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#64748B] space-y-2">
            <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p>No hospital employees provisioned yet.</p>
            <p className="text-xs text-[#94A3B8]">
              Click &quot;Add New Employee&quot; above to add your first Doctor or Receptionist.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">{emp.employeeId}</td>
                  <td className="py-3.5 px-4 font-bold text-[#16324F]">{emp.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        emp.role === "DOCTOR"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : emp.role === "RECEPTIONIST"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#1F2937] font-medium">{emp.department}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{emp.email}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{emp.phone || "-"}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-[#15803D] font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                      <span>{emp.status}</span>
                    </span>
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
