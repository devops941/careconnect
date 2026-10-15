"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LeaveRecord {
  _id: string;
  doctorId: string;
  doctorName: string;
  departmentName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  replacementDoctorName?: string;
  createdAt: string;
}

interface DoctorItem {
  _id: string;
  name: string;
  specialization: string;
  departmentName?: string;
  opdRoomNo: string;
  status: string;
  availableDays: string[];
  timeSlots: string[];
}

interface DoctorScheduleManagerProps {
  userRole?: string;
  currentDoctorId?: string;
}

export function DoctorScheduleManager({
  userRole = "ADMIN",
  currentDoctorId,
}: DoctorScheduleManagerProps) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);

  // Form State
  const [selectedDocId, setSelectedDocId] = useState(currentDoctorId || "");
  const [leaveType, setLeaveType] = useState<"CASUAL" | "MEDICAL" | "CONFERENCE" | "EMERGENCY">("CASUAL");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [replacementDoc, setReplacementDoc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaveRes, docRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/doctors"),
      ]);
      const leaveData = await leaveRes.json();
      const docData = await docRes.json();

      if (leaveData.success) setLeaves(leaveData.data);
      if (docData.success) {
        setDoctors(docData.data);
        if (!selectedDocId && docData.data.length > 0) {
          setSelectedDocId(docData.data[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load schedule data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setSubmitting(true);
      const doc = doctors.find((d) => d._id === selectedDocId);

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDocId,
          doctorName: doc?.name || "Doctor",
          departmentName: doc?.departmentName || doc?.specialization,
          leaveType,
          startDate,
          endDate,
          reason: reason.trim(),
          replacementDoctorName: replacementDoc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLeaves([data.data, ...leaves]);
        setIsApplyingLeave(false);
        setReason("");
        setReplacementDoc("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to submit leave:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (scheduleId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaves(leaves.map((l) => (l._id === scheduleId ? { ...l, status } : l)));
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const onDutyCount = doctors.filter((d) => d.status !== "ON_LEAVE").length;
  const onLeaveCount = doctors.filter((d) => d.status === "ON_LEAVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#0F766E]" />
            <span>Doctor Schedules, Shifts & Leave Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure weekly clinic shifts, manage doctor leave applications, and assign locum replacements.
          </p>
        </div>

        <Button
          onClick={() => setIsApplyingLeave(true)}
          className="gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave / Roster Exception</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">On-Duty Doctors</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{onDutyCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active Clinic Sessions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Doctors On Leave</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">{onLeaveCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Roster Suspended</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Leave Requests</span>
          <p className="text-2xl font-black text-blue-600 font-mono mt-1">
            {leaves.filter((l) => l.status === "PENDING").length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting Approval</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Weekly Shift Slots</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">14</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Morning & Evening OPD</span>
        </div>
      </div>

      {/* Roster & Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">Doctor Leave & Shift Roster ({leaves.length})</span>
          <span className="text-[11px] text-slate-400">Integrated with OPD Appointment Booking System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Clinician</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason & Replacement</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">Loading schedules...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    All specialists are currently on active OPD duty. No leave applications on file.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{l.doctorName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{l.departmentName || "General"}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 font-medium">{l.reason}</p>
                      {l.replacementDoctorName && (
                        <span className="text-[11px] text-[#0F766E] block font-semibold">
                          Locum: {l.replacementDoctorName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          l.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : l.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status === "PENDING" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(l._id, "APPROVED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-1"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusUpdate(l._id, "REJECTED")}
                            className="text-[11px] font-bold px-2 py-1"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isApplyingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Apply for Doctor Leave / Shift Exception</h3>
              <button onClick={() => setIsApplyingLeave(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Doctor</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="CONFERENCE">Medical Conference</option>
                    <option value="EMERGENCY">Emergency Personal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Replacement Locum Doctor (Optional)</label>
                  <Input
                    placeholder="e.g. Dr. Jennifer Miller"
                    value={replacementDoc}
                    onChange={(e) => setReplacementDoc(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date *"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date *"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Absence *</label>
                <Input
                  placeholder="e.g. Attending Annual Cardiology Summit at AIIMS"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsApplyingLeave(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-[#0F766E] hover:bg-[#115E59] text-white font-bold">
                  {submitting ? "Submitting..." : "Submit Leave Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
