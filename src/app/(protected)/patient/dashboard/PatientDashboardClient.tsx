"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  CalendarCheck2,
  ClipboardList,
  Stethoscope,
  Phone,
  ArrowRight,
  Clock,
  LayoutDashboard,
  CheckCircle2,
  Building2,
  FileText,
  Receipt,
  Star,
  RefreshCw,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardLayout, NavItem } from "@/components/layout/DashboardLayout";
import { AppointmentManager } from "@/components/appointments/AppointmentManager";
import { PrescriptionVault } from "@/components/patient/PrescriptionVault";
import { DoctorManager } from "@/components/doctors/DoctorManager";
import { PatientBillsView } from "@/components/patient/PatientBillsView";
import { FeedbackReviewManager } from "@/components/feedback/FeedbackReviewManager";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ActiveTokenInfo {
  tokenNumber: string;
  tokenSequence: number;
  status: string;
  doctorName: string;
  departmentName: string;
  opdRoomNo: string;
}

interface ActiveAppointmentInfo {
  _id: string;
  appointmentId: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  tokenNumber?: string;
  notes?: string;
}

interface PatientDashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    identityType?: string;
    status?: string;
  };
  hospitalSettings: {
    hospitalName: string;
    tagline?: string;
    emergencyPhone?: string;
    emergency24x7?: boolean;
  };
  activeToken: ActiveTokenInfo | null;
  activeAppointment?: ActiveAppointmentInfo | null;
}

export function PatientDashboardClient({
  user,
  hospitalSettings,
  activeToken,
  activeAppointment,
}: PatientDashboardClientProps) {
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || params.get("section");
      if (urlTab) return urlTab;
      const saved = localStorage.getItem(`careconnect_patient_tab_${user.id}`);
      if (saved) return saved;
    }
    return "overview";
  });

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`careconnect_patient_tab_${user.id}`, sectionId);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", sectionId);
        window.history.replaceState(null, "", url.toString());
      } catch (err) {
        console.error("Failed to update patient tab URL/localStorage", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || params.get("section");
      const savedTab = urlTab || localStorage.getItem(`careconnect_patient_tab_${user.id}`);
      if (savedTab) {
        setActiveSection(savedTab);
        const url = new URL(window.location.href);
        if (url.searchParams.get("tab") !== savedTab) {
          url.searchParams.set("tab", savedTab);
          window.history.replaceState(null, "", url.toString());
        }
      }

      const handlePopState = () => {
        const currentParams = new URLSearchParams(window.location.search);
        const popTab = currentParams.get("tab") || currentParams.get("section");
        if (popTab) {
          setActiveSection(popTab);
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [user.id]);

  const [liveToken, setLiveToken] = useState<ActiveTokenInfo | null>(activeToken);
  const [liveAppointment, setLiveAppointment] = useState<ActiveAppointmentInfo | null>(
    activeAppointment || null
  );

  const fetchLiveStatus = async () => {
    try {
      const [queueRes, aptRes] = await Promise.all([
        fetch(`/api/queue?patientId=${user.id}`),
        fetch("/api/appointments"),
      ]);

      if (queueRes.ok) {
        const qData = await queueRes.json();
        if (qData.success && Array.isArray(qData.data) && qData.data.length > 0) {
          const active = qData.data.find(
            (t: any) =>
              t.status === "WAITING" || t.status === "CALLED" || t.status === "IN_CONSULTATION"
          );
          if (active) {
            setLiveToken({
              tokenNumber: active.tokenNumber,
              tokenSequence: active.tokenSequence,
              status: active.status,
              doctorName: active.doctorName,
              departmentName: active.departmentName,
              opdRoomNo: active.opdRoomNo || "Room 101",
            });
          }
        }
      }

      if (aptRes.ok) {
        const aData = await aptRes.json();
        if (aData.success && Array.isArray(aData.data) && aData.data.length > 0) {
          const activeApt = aData.data.find(
            (a: any) =>
              a.status === "CONFIRMED" || a.status === "CHECKED_IN" || a.status === "PENDING"
          );
          if (activeApt) {
            setLiveAppointment({
              _id: activeApt._id,
              appointmentId: activeApt.appointmentId,
              doctorName: activeApt.doctorName,
              departmentName: activeApt.departmentName,
              appointmentDate: activeApt.appointmentDate,
              timeSlot: activeApt.timeSlot,
              status: activeApt.status,
              tokenNumber: activeApt.tokenNumber,
              notes: activeApt.notes,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh live status", err);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, [activeSection]);

  // All sidebar navigation items for Patient
  const patientNavItems: NavItem[] = [
    {
      id: "overview",
      title: "Patient Overview",
      icon: LayoutDashboard,
    },
    {
      id: "queue",
      title: "My Live Ticket",
      icon: Clock,
      badge: liveToken ? "Live" : liveAppointment ? "Pass" : undefined,
    },
    {
      id: "appointments",
      title: "My Appointments",
      icon: CalendarCheck2,
    },
    {
      id: "prescriptions",
      title: "Prescriptions & Vault",
      icon: ClipboardList,
    },
    {
      id: "bills",
      title: "Bills & Receipts",
      icon: Receipt,
    },
    {
      id: "feedback",
      title: "Doctor Reviews & CSAT",
      icon: Star,
    },
    {
      id: "doctors",
      title: "Specialists & Doctors",
      icon: Stethoscope,
    },
  ];

  return (
    <DashboardLayout
      user={user}
      hospitalName={hospitalSettings.hospitalName}
      emergencyPhone={hospitalSettings.emergencyPhone}
      emergency24x7={hospitalSettings.emergency24x7}
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      customNavItems={patientNavItems}
    >
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. OVERVIEW SECTION                                                       */}
        {/* ========================================================================= */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#CCFBF1] text-xs font-semibold backdrop-blur-xs border border-white/10">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Verified Patient Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, {user.name}
                </h1>
                <p className="text-sm text-[#CCFBF1] max-w-xl">
                  {hospitalSettings.hospitalName} • Real-time queue status, appointment booking, and electronic prescriptions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleSelectSection("appointments")}
                  className="bg-white text-[#0F766E] hover:bg-[#F8FAFC] font-bold gap-2 text-xs shadow-sm"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>Book New Appointment</span>
                </Button>
              </div>
            </div>

            {/* Active Live Queue Token / Confirmed Booking Pass Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#16324F]">Your Active Queue Ticket & Booking Pass</h2>
                    <p className="text-xs text-[#64748B]">Real-time OPD triage status and consultation entry pass</p>
                  </div>
                </div>

                {liveToken ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse" />
                    <span>{liveToken.status === "CALLED" ? "Calling to Room" : "Live Queue Active"}</span>
                  </span>
                ) : liveAppointment ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                    <span>Confirmed Pass Available</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">
                    No Token Dispatched Today
                  </span>
                )}
              </div>

              {liveToken ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Your Token Number
                    </span>
                    <p className="text-3xl font-black text-[#0F766E] font-mono">
                      {liveToken.tokenNumber}
                    </p>
                    <span className="text-[11px] text-[#64748B]">{liveToken.departmentName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Current Status
                    </span>
                    <p className="text-2xl font-black text-[#16324F]">
                      {liveToken.status === "CALLED"
                        ? "Proceed to Room"
                        : liveToken.status === "IN_CONSULTATION"
                        ? "In Consultation"
                        : "Waiting"}
                    </p>
                    <span className="text-[11px] text-[#15803D] font-medium">Please stay in waiting lobby</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Assigned Room
                    </span>
                    <p className="text-3xl font-black text-[#16324F]">{liveToken.opdRoomNo}</p>
                    <span className="text-[11px] text-[#64748B]">Dr. {liveToken.doctorName}</span>
                  </div>
                </div>
              ) : liveAppointment ? (
                <div className="pt-4 space-y-3">
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#0F766E] bg-white px-2.5 py-0.5 rounded-md border border-teal-200">
                          {liveAppointment.appointmentId}
                        </span>
                        <StatusBadge status={liveAppointment.status} />
                      </div>
                      <h4 className="text-sm font-bold text-[#16324F]">
                        Dr. {liveAppointment.doctorName} • {liveAppointment.departmentName}
                      </h4>
                      <p className="text-xs text-[#64748B]">
                        Scheduled for: <span className="font-semibold text-[#16324F]">{liveAppointment.appointmentDate}</span> at <span className="font-semibold text-[#16324F]">{liveAppointment.timeSlot}</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSelectSection("queue")}
                      className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5 shrink-0"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Open Consultation Ticket</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-6 pb-2 text-center space-y-3">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-[#16324F]">
                    You do not have an active queue ticket today.
                  </p>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Book an appointment or check-in at the hospital front desk to generate your live queue ticket.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleSelectSection("appointments")}
                    className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold"
                  >
                    Schedule Consultation
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div
                onClick={() => handleSelectSection("appointments")}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 hover:border-[#0F766E] cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#16324F]">Upcoming Appointments</h3>
                <p className="text-xs text-[#64748B]">Schedule follow-up consultations with clinical specialists.</p>
                <div className="pt-2 text-xs font-bold text-[#0F766E] flex items-center gap-1">
                  <span>View appointments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => handleSelectSection("prescriptions")}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3 hover:border-[#0F766E] cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#16324F]">Medical Prescriptions</h3>
                <p className="text-xs text-[#64748B]">Access doctor notes, diagnostic lab orders, and digital receipts.</p>
                <div className="pt-2 text-xs font-bold text-[#0F766E] flex items-center gap-1">
                  <span>Open health vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#16324F]">Emergency Dispatch</h3>
                <p className="text-xs text-[#64748B]">Immediate trauma helpline: {hospitalSettings.emergencyPhone}</p>
                <a
                  href={`tel:${hospitalSettings.emergencyPhone}`}
                  className="pt-2 text-xs font-bold text-[#B91C1C] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Dial Emergency Hotline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. LIVE QUEUE TICKET SECTION                                              */}
        {/* ========================================================================= */}
        {activeSection === "queue" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#0F766E]" />
                  <span>My Live Ticket & Consultation Pass</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Your real-time queue boarding status and digital outpatient appointment ticket
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchLiveStatus}
                  className="gap-1.5 text-xs text-[#16324F]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-[#16324F] hover:bg-[#0F2236] text-xs font-bold gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </Button>
              </div>
            </div>

            {liveToken ? (
              /* LIVE OPD QUEUE TOKEN DISPLAY (Checked in at Hospital Desk) */
              <div className="p-8 rounded-2xl bg-teal-50/70 border border-teal-200 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase font-extrabold bg-[#CCFBF1] text-teal-900 border border-[#99F6E4] tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                  <span>Today&apos;s Active OPD Token</span>
                </div>

                <p className="text-7xl font-black font-mono text-[#0F766E] tracking-tight">
                  {liveToken.tokenNumber}
                </p>

                <div className="space-y-1">
                  <p className="text-lg font-extrabold text-[#16324F]">
                    {liveToken.departmentName} • Room: {liveToken.opdRoomNo}
                  </p>
                  <p className="text-sm font-semibold text-[#0F766E]">
                    Attending Specialist: Dr. {liveToken.doctorName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-xs text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Est. Waiting Time</span>
                    <span className="text-base font-black font-mono text-amber-700">~15 - 20 mins</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-xs text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Queue Status</span>
                    <span className="text-base font-black font-mono text-[#0F766E]">{liveToken.status}</span>
                  </div>
                </div>

                <p className="text-xs text-[#64748B] pt-2">
                  Please stay in the clinical waiting lobby. Your token number will be announced on the lobby TV screens.
                </p>
              </div>
            ) : liveAppointment ? (
              /* CONFIRMED DIGITAL APPOINTMENT PASS / TICKET */
              <div className="bg-white rounded-2xl border-2 border-[#0F766E]/30 overflow-hidden shadow-md">
                {/* Boarding pass top accent */}
                <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                        Hospital Outpatient Pass
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-100">
                        ID: {liveAppointment.appointmentId}
                      </span>
                    </div>
                    <h3 className="text-xl font-black">Confirmed Consultation Ticket</h3>
                    <p className="text-xs text-teal-100">
                      CareConnect Digital Health Suite • {hospitalSettings.hospitalName}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={liveAppointment.status} className="bg-white text-emerald-800 border-white text-xs px-3 py-1 shadow-xs" />
                    {liveAppointment.tokenNumber && (
                      <span className="text-xs font-mono font-black bg-teal-900 text-teal-200 px-2.5 py-1 rounded-lg">
                        Token: {liveAppointment.tokenNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pass Details Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Specialist Doctor</span>
                      <p className="text-sm font-extrabold text-[#16324F]">Dr. {liveAppointment.doctorName}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Department</span>
                      <p className="text-sm font-extrabold text-[#16324F]">{liveAppointment.departmentName}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Appointment Date</span>
                      <p className="text-sm font-extrabold text-[#0F766E] font-mono">{liveAppointment.appointmentDate}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Scheduled Time Slot</span>
                      <p className="text-sm font-extrabold text-[#16324F] font-mono">{liveAppointment.timeSlot}</p>
                    </div>
                  </div>

                  {/* Patient & Instructions banner */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Booking Confirmed in Hospital System</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your consultation with <span className="font-bold">Dr. {liveAppointment.doctorName}</span> is officially booked. On your visit date (<span className="font-bold">{liveAppointment.appointmentDate}</span>), present this ticket pass at the hospital reception desk to receive your live OPD queue token number.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                    <span className="text-xs text-[#64748B]">
                      Patient: <strong className="text-[#16324F]">{user.name}</strong>
                    </span>

                    <Button
                      size="sm"
                      onClick={() => setActiveSection("appointments")}
                      className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5"
                    >
                      <CalendarCheck2 className="w-4 h-4" />
                      <span>View All Appointments</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* NO ACTIVE BOOKING OR TOKEN */
              <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-[#E2E8F0]">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-[#16324F]">No Active Token Issued</h4>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Schedule an appointment or check in at the reception to receive your live queue token.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveSection("appointments")}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold"
                >
                  Book Appointment Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. APPOINTMENTS SECTION                                                   */}
        {/* ========================================================================= */}
        {activeSection === "appointments" && <AppointmentManager currentUser={user} />}

        {/* ========================================================================= */}
        {/* 4. PRESCRIPTIONS SECTION                                                  */}
        {/* ========================================================================= */}
        {activeSection === "prescriptions" && <PrescriptionVault />}

        {/* ========================================================================= */}
        {/* 5. BILLS & RECEIPTS SECTION                                              */}
        {/* ========================================================================= */}
        {activeSection === "bills" && (
          <PatientBillsView
            hospitalName={hospitalSettings.hospitalName}
            emergencyPhone={hospitalSettings.emergencyPhone}
          />
        )}

        {/* ========================================================================= */}
        {/* 5B. PATIENT FEEDBACK & DOCTOR REVIEWS                                     */}
        {/* ========================================================================= */}
        {activeSection === "feedback" && <FeedbackReviewManager userRole="PATIENT" />}

        {/* ========================================================================= */}
        {/* 6. DOCTORS DIRECTORY SECTION                                              */}
        {/* ========================================================================= */}
        {activeSection === "doctors" && (
          <DoctorManager
            readOnly={true}
            onBookAppointment={() => setActiveSection("appointments")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
