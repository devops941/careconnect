"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardLayout, NavItem } from "@/components/layout/DashboardLayout";
import { AppointmentManager } from "@/components/appointments/AppointmentManager";
import { PrescriptionVault } from "@/components/patient/PrescriptionVault";
import { DoctorManager } from "@/components/doctors/DoctorManager";
import { PatientBillsView } from "@/components/patient/PatientBillsView";
import { FeedbackReviewManager } from "@/components/feedback/FeedbackReviewManager";

interface ActiveTokenInfo {
  tokenNumber: string;
  tokenSequence: number;
  status: string;
  doctorName: string;
  departmentName: string;
  opdRoomNo: string;
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
}

export function PatientDashboardClient({
  user,
  hospitalSettings,
  activeToken,
}: PatientDashboardClientProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

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
      badge: activeToken ? "Active" : undefined,
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
      onSelectSection={setActiveSection}
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
                  onClick={() => setActiveSection("appointments")}
                  className="bg-white text-[#0F766E] hover:bg-[#F8FAFC] font-bold gap-2 text-xs shadow-sm"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>Book New Appointment</span>
                </Button>
              </div>
            </div>

            {/* Active Live Queue Token Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#16324F]">Your Active Queue Ticket</h2>
                    <p className="text-xs text-[#64748B]">Real-time OPD triage status for today&apos;s visit</p>
                  </div>
                </div>

                {activeToken ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse" />
                    <span>{activeToken.status === "CALLED" ? "Calling to Room" : "Live Queue Active"}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">
                    No Token Dispatched Today
                  </span>
                )}
              </div>

              {activeToken ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Your Token Number
                    </span>
                    <p className="text-3xl font-black text-[#0F766E] font-mono">
                      {activeToken.tokenNumber}
                    </p>
                    <span className="text-[11px] text-[#64748B]">{activeToken.departmentName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Current Status
                    </span>
                    <p className="text-2xl font-black text-[#16324F]">
                      {activeToken.status === "CALLED"
                        ? "Proceed to Room"
                        : activeToken.status === "IN_CONSULTATION"
                        ? "In Consultation"
                        : "Waiting"}
                    </p>
                    <span className="text-[11px] text-[#15803D] font-medium">Please stay in waiting lobby</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                    <span className="text-xs text-[#64748B] uppercase font-bold tracking-wider">
                      Assigned Room
                    </span>
                    <p className="text-3xl font-black text-[#16324F]">{activeToken.opdRoomNo}</p>
                    <span className="text-[11px] text-[#64748B]">Dr. {activeToken.doctorName}</span>
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
                    onClick={() => setActiveSection("appointments")}
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
                onClick={() => setActiveSection("appointments")}
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
                onClick={() => setActiveSection("prescriptions")}
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
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#0F766E]" />
              <span>Live Queue & Token Status</span>
            </h3>

            {activeToken ? (
              <div className="p-8 rounded-2xl bg-teal-50/60 border border-teal-200 text-center space-y-3">
                <span className="text-xs uppercase font-extrabold text-teal-800 tracking-wider">
                  Today&apos;s Token
                </span>
                <p className="text-6xl font-black font-mono text-[#0F766E]">
                  {activeToken.tokenNumber}
                </p>
                <p className="text-base font-bold text-[#16324F]">
                  Department: {activeToken.departmentName} • Room: {activeToken.opdRoomNo}
                </p>
                <p className="text-xs text-[#64748B]">Attending: Dr. {activeToken.doctorName}</p>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-teal-200/80 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Est. Waiting Time</span>
                    <span className="text-sm font-black font-mono text-amber-700">~15 - 20 mins</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-teal-200/80 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Queue Position</span>
                    <span className="text-sm font-black font-mono text-[#0F766E]">2 Ahead of You</span>
                  </div>
                </div>

                <span className="inline-block mt-3 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0F766E] text-white shadow-xs">
                  Status: {activeToken.status}
                </span>
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
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
        {activeSection === "doctors" && <DoctorManager />}
      </div>
    </DashboardLayout>
  );
}
