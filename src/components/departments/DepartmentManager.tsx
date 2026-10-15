"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit, CheckCircle2, Loader2, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

interface DepartmentItem {
  _id: string;
  deptId: string;
  name: string;
  description?: string;
  headDoctorName?: string;
  opdRoomNo?: string;
  status: "ACTIVE" | "INACTIVE";
}

export function DepartmentManager() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Page view mode: "list" | "create" | "edit" (No overlay!)
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [deptId, setDeptId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headDoctorName, setHeadDoctorName] = useState("");
  const [opdRoomNo, setOpdRoomNo] = useState("Room 101");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (res.ok && data.success) {
        setDepartments(data.data || []);
      }
    } catch {
      console.error("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openCreatePage = () => {
    setEditingId(null);
    setDeptId("");
    setName("");
    setDescription("");
    setHeadDoctorName("");
    setOpdRoomNo("Room 101");
    setStatus("ACTIVE");
    setFormError(null);
    setViewMode("create");
  };

  const openEditPage = (dept: DepartmentItem) => {
    setEditingId(dept._id);
    setDeptId(dept.deptId);
    setName(dept.name);
    setDescription(dept.description || "");
    setHeadDoctorName(dept.headDoctorName || "");
    setOpdRoomNo(dept.opdRoomNo || "Room 101");
    setStatus(dept.status);
    setFormError(null);
    setViewMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Department Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingId ? `/api/departments/${editingId}` : "/api/departments";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deptId: deptId.trim() || `DEP-${name.slice(0, 3).toUpperCase()}`,
          name: name.trim(),
          description: description.trim(),
          headDoctorName: headDoctorName.trim(),
          opdRoomNo: opdRoomNo.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save department");
      }

      toast.success(editingId ? "Department updated successfully" : "Department created successfully");
      setViewMode("list");
      loadDepartments();
    } catch (err: any) {
      setFormError(err.message || "Error saving department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.deptId.toLowerCase().includes(search.toLowerCase())
  );

  // FULL-PAGE VIEW: Create / Edit Clinical Department (NO OVERLAY!)
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Header with Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Departments List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                {editingId ? "Edit Clinical Department" : "Add New Clinical Department"}
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure department code, OPD room allocation, and clinical status.
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

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Department Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department Code *"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value.toUpperCase())}
                placeholder="e.g. CARD or PEDI"
                disabled={!!editingId}
                required
              />

              <Input
                label="Department Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cardiology & Critical Care"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1F2937]">Department Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of clinical services, diagnostic labs, or facilities..."
                rows={3}
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Clinical Administration & OPD Room
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Head of Department (Doctor Name)"
                value={headDoctorName}
                onChange={(e) => setHeadDoctorName(e.target.value)}
                placeholder="e.g. Dr. K. Ramanathan"
              />

              <Input
                label="OPD Consultation Room *"
                value={opdRoomNo}
                onChange={(e) => setOpdRoomNo(e.target.value)}
                placeholder="e.g. Room 204 (Wing B)"
                required
              />

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1F2937]">Department Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="ACTIVE">Active (Available for OPD Appointments)</option>
                  <option value="INACTIVE">Inactive (Temporarily Closed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
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
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? "Save Department Changes" : "Create Clinical Department"}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">Clinical Departments</h2>
            <p className="text-xs text-[#64748B]">Manage hospital medical divisions and OPD rooms</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <Button size="sm" onClick={openCreatePage} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading departments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] space-y-1">
            <p>No clinical departments found.</p>
            <p className="text-[11px] text-[#94A3B8]">Click "Add Department" to create your first medical division.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Head of Department</th>
                <th className="py-3 px-4">OPD Room</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((dept) => (
                <tr key={dept._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">{dept.deptId}</td>
                  <td className="py-3 px-4 font-bold text-[#16324F]">{dept.name}</td>
                  <td className="py-3 px-4 text-[#64748B]">{dept.headDoctorName || "Unassigned"}</td>
                  <td className="py-3 px-4 text-[#1F2937]">{dept.opdRoomNo || "Room 101"}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={dept.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEditPage(dept)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-[#CCFBF1]/50 transition-colors"
                      title="Edit Department"
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
