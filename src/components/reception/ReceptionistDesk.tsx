"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Ticket,
  CalendarCheck2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Stethoscope,
  Building2,
  Phone,
  ArrowRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";

interface ReceptionistDeskProps {
  onNavigateSection: (sectionId: string) => void;
}

export function ReceptionistDesk({ onNavigateSection }: ReceptionistDeskProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [queueTokens, setQueueTokens] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [aptRes, queueRes, docRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/queue"),
        fetch("/api/doctors"),
      ]);

      const aptData = await aptRes.json();
      const queueData = await queueRes.json();
      const docData = await docRes.json();

      if (aptRes.ok && aptData.success) setAppointments(aptData.data || []);
      if (queueRes.ok && queueData.success) setQueueTokens(queueData.data || []);
      if (docRes.ok && docData.success) setDoctors(docData.data || []);
    } catch {
      console.error("Failed to load front desk data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickCheckIn = async (apt: any) => {
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          doctorId: apt.doctorId,
          departmentId: apt.departmentId,
          appointmentId: apt._id,
          priority: "NORMAL",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Check-in failed");
      }

      toast.success(`Check-in successful! Token Issued: ${data.data.tokenNumber}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue token");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);

  const waitingCount = queueTokens.filter((t) => t.status === "WAITING").length;
  const inConsultCount = queueTokens.filter((t) => t.status === "IN_CONSULTATION" || t.status === "CALLED").length;
  const completedCount = queueTokens.filter((t) => t.status === "COMPLETED").length;

  const activeDoctors = doctors.filter((d) => d.status === "ACTIVE");

  const filteredAppointments = todayAppointments.filter((a) =>
    a.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    a.appointmentId.toLowerCase().includes(patientSearch.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      {/* Front Desk Hero Banner */}
      <div className="bg-[#16324F] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Front Desk & Triage Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient Reception & Queue Desk
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Register unscheduled walk-in patients, manage appointment check-ins, issue OPD tokens, and monitor waiting crowds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => onNavigateSection("queue")}
            className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            <span>Issue Walk-in Token</span>
          </Button>

          <Button
            onClick={() => onNavigateSection("appointments")}
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs font-bold gap-2"
          >
            <CalendarCheck2 className="w-4 h-4 text-teal-300" />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>

      {/* Front Desk Operational Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Currently Waiting</span>
          <p className="text-2xl font-extrabold text-[#16324F]">{waitingCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-2">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase">In Consultation</span>
          <p className="text-2xl font-extrabold text-blue-900">{inConsultCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-2">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Today's Bookings</span>
          <p className="text-2xl font-extrabold text-[#0F766E]">{todayAppointments.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Completed Today</span>
          <p className="text-2xl font-extrabold text-emerald-900">{completedCount}</p>
        </div>
      </div>

      {/* Main Front Desk Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Appointments with 1-Click Check-in */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-[#0F766E]" />
                <span>Today's Expected Appointments</span>
              </h2>
              <p className="text-xs text-[#64748B]">Verify arriving patients and issue instant queue tokens</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient / doctor..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-48 sm:w-60 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#64748B]">Loading today's schedule...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CalendarCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-[#64748B]">No appointments matching query.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Specialist Doctor</th>
                    <th className="py-3 px-3">Time Slot</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#16324F] block">{apt.patientName}</span>
                        <span className="text-[11px] text-[#64748B]">{apt.patientPhone || "-"}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#16324F] block">{apt.doctorName}</span>
                        <span className="text-[11px] text-[#64748B]">{apt.departmentName}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#16324F]">{apt.timeSlot}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {apt.status === "CONFIRMED" ? (
                          <Button
                            size="sm"
                            onClick={() => handleQuickCheckIn(apt)}
                            className="bg-[#0F766E] hover:bg-[#115E59] text-[11px] h-7 px-2.5 font-bold gap-1"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>Check In</span>
                          </Button>
                        ) : apt.tokenNumber ? (
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono font-bold text-[11px]">
                            {apt.tokenNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Specialist Doctors On-Duty Quick Glance */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                <span>On-Duty Clinicians</span>
              </h3>
              <p className="text-[11px] text-[#64748B]">Active doctors available for walk-ins</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] text-[10px] font-bold">
              {activeDoctors.length} Active
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activeDoctors.length === 0 ? (
              <p className="text-xs text-[#64748B] text-center py-6">No doctors currently on active duty.</p>
            ) : (
              activeDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F766E] transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs text-[#16324F] block">{doc.name}</span>
                      <span className="text-[10px] text-[#64748B] block">{doc.specialization}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px] shrink-0">
                      {doc.opdRoomNo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-slate-200/60">
                    <span>{doc.departmentName || "General OPD"}</span>
                    <span className="font-bold text-[#0F766E]">₹{doc.consultationFee}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateSection("staff_doctors")}
            className="w-full text-xs font-bold text-[#0F766E] hover:bg-teal-50"
          >
            <span>View Full Clinician Directory</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
