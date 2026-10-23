"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Ticket,
  CalendarCheck2,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  Settings,
  ArrowRight,
  Tv,
  CreditCard,
  Calendar,
  Star,
  Database,
  UserCheck,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardLayout, NavItem } from "@/components/layout/DashboardLayout";
import { LiveQueueBoard } from "@/components/queue/LiveQueueBoard";
import { DoctorConsultationDesk } from "@/components/doctor/DoctorConsultationDesk";
import { NurseVitalsStation } from "@/components/nurse/NurseVitalsStation";
import { AppointmentManager } from "@/components/appointments/AppointmentManager";
import { AdminPatientManager } from "@/components/patient/AdminPatientManager";
import { DepartmentManager } from "@/components/departments/DepartmentManager";
import { StaffDoctorManager } from "@/components/staff/StaffDoctorManager";
import { ReceptionistDesk } from "@/components/reception/ReceptionistDesk";
import { AnalyticsReports } from "@/components/analytics/AnalyticsReports";
import { HospitalProfileView } from "@/components/hospital/HospitalProfileView";
import { HospitalManagement } from "@/components/hospital/HospitalManagement";
import { HospitalBillingManager } from "@/components/billing/HospitalBillingManager";
import { DoctorScheduleManager } from "@/components/doctor/DoctorScheduleManager";
import { FeedbackReviewManager } from "@/components/feedback/FeedbackReviewManager";
import { SystemMaintenanceManager } from "@/components/system/SystemMaintenanceManager";

interface StaffDashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    identityType?: string;
    status?: string;
  };
  hospitalSettings: {
    hospitalName: string;
    tagline?: string;
    contactEmail?: string;
    emergencyPhone?: string;
    licenseNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    departments?: string[];
    emergency24x7?: boolean;
    onboardingCompleted?: boolean;
  };
}

export function StaffDashboardClient({
  user,
  hospitalSettings,
}: StaffDashboardClientProps) {
  const isDoctor = user.role === "DOCTOR";
  const isReceptionist = user.role === "RECEPTIONIST";
  const isNurse = user.role === "NURSE";
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  // Login-tailored default landed section
  const defaultSection = isDoctor
    ? "consultation"
    : isNurse
    ? "vitals"
    : isReceptionist
    ? "reception"
    : "overview";

  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || params.get("section");
      if (urlTab) return urlTab;
      const saved = localStorage.getItem(`careconnect_staff_tab_${user.id}`);
      if (saved) return saved;
    }
    return defaultSection;
  });

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`careconnect_staff_tab_${user.id}`, sectionId);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", sectionId);
        window.history.replaceState(null, "", url.toString());
      } catch (err) {
        console.error("Failed to update tab URL/localStorage", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || params.get("section");
      const savedTab = urlTab || localStorage.getItem(`careconnect_staff_tab_${user.id}`);
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

  // Role-tailored sidebar navigation items
  const staffNavItems: NavItem[] = [
    // 1. DOCTOR-SPECIFIC SIDEBAR
    ...(isDoctor
      ? [
          {
            id: "consultation",
            title: "My OPD Desk & Rx Pad",
            icon: Stethoscope,
            badge: "Desk",
          },
          {
            id: "appointments",
            title: "Appointments Desk",
            icon: CalendarCheck2,
          },
          // {
          //   id: "queue",
          //   title: "Live Queue & TV Display",
          //   icon: Clock,
          //   badge: "Live",
          // },
          {
            id: "vitals",
            title: "OPD Vitals Station",
            icon: HeartPulse,
          },
          {
            id: "schedules",
            title: "My Roster & Leaves",
            icon: Calendar,
          },
          {
            id: "feedback",
            title: "Patient Reviews & CSAT",
            icon: Star,
          },
          {
            id: "analytics",
            title: "Clinical Analytics",
            icon: BarChart3,
          },
        ]
      : []),

    // 2. RECEPTIONIST-SPECIFIC SIDEBAR
    ...(isReceptionist
      ? [
          {
            id: "reception",
            title: "Front Desk & Triage",
            icon: Users,
            badge: "Hub",
          },
          {
            id: "vitals",
            title: "OPD Vitals Station",
            icon: HeartPulse,
          },
          {
            id: "appointments",
            title: "Appointments Desk",
            icon: CalendarCheck2,
          },
          {
            id: "patients",
            title: "Patient Management",
            icon: UserCheck,
          },
          {
            id: "billing",
            title: "Billing & Cashier",
            icon: CreditCard,
          },
          {
            id: "schedules",
            title: "Doctor Duty Roster",
            icon: Calendar,
          },
          {
            id: "staff_doctors",
            title: "Staff & Doctor Directory",
            icon: Stethoscope,
          },
          {
            id: "analytics",
            title: "Queue Analytics",
            icon: BarChart3,
          },
        ]
      : []),

    // 2B. NURSE-SPECIFIC SIDEBAR
    ...(isNurse
      ? [
          {
            id: "vitals",
            title: "OPD Vitals Station",
            icon: HeartPulse,
            badge: "Triage",
          },
          {
            id: "appointments",
            title: "Appointments Desk",
            icon: CalendarCheck2,
          },
          {
            id: "patients",
            title: "Patient Registry",
            icon: UserCheck,
          },
          {
            id: "schedules",
            title: "Duty Roster & Shifts",
            icon: Calendar,
          },
        ]
      : []),

    // 3. ADMIN / SUPER_ADMIN SPECIFIC SIDEBAR
    ...(isAdmin
      ? [
          {
            id: "overview",
            title: "Operations Hub",
            icon: LayoutDashboard,
          },
          {
            id: "vitals",
            title: "OPD Vitals Station",
            icon: HeartPulse,
            badge: "Nurse",
          },
          {
            id: "appointments",
            title: "Appointments Desk",
            icon: CalendarCheck2,
          },
          // {
          //   id: "queue",
          //   title: "Live Queue & TV Display",
          //   icon: Clock,
          //   badge: "Live",
          // },
          {
            id: "patients",
            title: "Patient Management",
            icon: UserCheck,
          },
         
          {
            id: "staff_doctors",
            title: "Staff & Doctor Management",
            icon: Users,
          },
          {
            id: "departments",
            title: "Department Management",
            icon: Building2,
          },
          {
            id: "hospitals",
            title: "Hospital Network & Branches",
            icon: Building2,
            badge: "Branches",
          },
          {
            id: "billing",
            title: "Billing & Cashier",
            icon: CreditCard,
          },
          {
            id: "schedules",
            title: "Shifts & Leave Approvals",
            icon: Calendar,
          },
          {
            id: "feedback",
            title: "Patient Feedback & CSAT",
            icon: Star,
          },
          {
            id: "analytics",
            title: "Analytics & Reports",
            icon: BarChart3,
          },
          ...(user.role === "SUPER_ADMIN"
            ? [
                {
                  id: "settings",
                  title: "Hospital Profile & Config",
                  icon: Building2,
                  superAdminOnly: true,
                },
                {
                  id: "maintenance",
                  title: "Backup & Maintenance",
                  icon: Database,
                  superAdminOnly: true,
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <DashboardLayout
      user={user}
      hospitalName={hospitalSettings.hospitalName}
      emergencyPhone={hospitalSettings.emergencyPhone}
      emergency24x7={hospitalSettings.emergency24x7}
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      customNavItems={staffNavItems}
    >
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. OPERATIONS HUB / OVERVIEW                                              */}
        {/* ========================================================================= */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Executive Hospital Banner */}
            <div className="bg-[#16324F] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Clinical Operations • {user.role}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {hospitalSettings.hospitalName}
                </h1>
                <p className="text-sm text-slate-300 max-w-xl">
                  {hospitalSettings.tagline ||
                    "Modern Outpatient Clinical Management & Digital Queue Engine"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleSelectSection("queue")}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Open Live Queue</span>
                </Button>

                {isAdmin && (
                  <Button
                    onClick={() => handleSelectSection("settings")}
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 text-xs font-bold gap-2"
                  >
                    <Building2 className="w-4 h-4 text-teal-300" />
                    <span>Hospital Profile</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Access Operational Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => handleSelectSection("queue")}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#0F766E] cursor-pointer transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#16324F]">Live OPD Queue</h3>
                <p className="text-xs text-[#64748B]">Triage patients and monitor clinic rooms in real-time.</p>
                <span className="text-xs font-bold text-[#0F766E] flex items-center gap-1 pt-1">
                  Launch Queue <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => handleSelectSection("appointments")}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#0F766E] cursor-pointer transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#16324F]">Appointments Desk</h3>
                <p className="text-xs text-[#64748B]">Schedule consultations, check-ins, and doctor timings.</p>
                <span className="text-xs font-bold text-[#0F766E] flex items-center gap-1 pt-1">
                  Manage Slots <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {isAdmin && (
                <>
                  <div
                    onClick={() => handleSelectSection("departments")}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#0F766E] cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#16324F]">Departments</h3>
                    <p className="text-xs text-[#64748B]">Configure clinical units, OPD rooms, and heads.</p>
                    <span className="text-xs font-bold text-[#0F766E] flex items-center gap-1 pt-1">
                      Manage Units <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div
                    onClick={() => handleSelectSection("staff_doctors")}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#0F766E] cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#16324F]">Staff & Doctor Hub</h3>
                    <p className="text-xs text-[#64748B]">Manage specialists, front desk staff, and access credentials.</p>
                    <span className="text-xs font-bold text-[#0F766E] flex items-center gap-1 pt-1">
                      Manage Personnel <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Embedded Live KPI & Caseload Analytics */}
            <AnalyticsReports />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. RECEPTIONIST FRONT DESK OPERATIONS                                     */}
        {/* ========================================================================= */}
        {activeSection === "reception" && isReceptionist && (
          <ReceptionistDesk onNavigateSection={handleSelectSection} />
        )}

        {/* ========================================================================= */}
        {/* 2B. NURSE OPD VITALS & TRIAGE STATION                                     */}
        {/* ========================================================================= */}
        {activeSection === "vitals" && (
          <NurseVitalsStation nurseName={user.name} />
        )}

        {/* ========================================================================= */}
        {/* 3. DOCTOR CONSULTATION & DIGITAL RX                                       */}
        {/* ========================================================================= */}
        {activeSection === "consultation" && isDoctor && (
          <DoctorConsultationDesk
            doctorName={user.name}
            doctorId={user.id}
            departmentName={user.department || "Consultant Physician"}
          />
        )}

        {/* ========================================================================= */}
        {/* 4. LIVE QUEUE & WAITING ROOM TV                                           */}
        {/* ========================================================================= */}
        {activeSection === "queue" && (
          <LiveQueueBoard
            userRole={user.role}
            currentDoctorId={isDoctor ? user.id : undefined}
          />
        )}

        {/* ========================================================================= */}
        {/* 5. APPOINTMENTS MANAGER                                                   */}
        {/* ========================================================================= */}
        {activeSection === "appointments" && <AppointmentManager currentUser={user} />}

        {/* ========================================================================= */}
        {/* 5A. PATIENT REGISTRY & MANAGEMENT                                         */}
        {/* ========================================================================= */}
        {activeSection === "patients" && <AdminPatientManager />}

        {/* ========================================================================= */}
        {/* 5B. HOSPITAL BILLING & CASHIER DESK                                       */}
        {/* ========================================================================= */}
        {activeSection === "billing" && <HospitalBillingManager />}

        {/* ========================================================================= */}
        {/* 5C. DOCTOR SCHEDULES, SHIFTS & LEAVES                                     */}
        {/* ========================================================================= */}
        {activeSection === "schedules" && (
          <DoctorScheduleManager
            userRole={user.role}
            currentDoctorId={isDoctor ? user.id : undefined}
          />
        )}

        {/* ========================================================================= */}
        {/* 5D. PATIENT FEEDBACK & DOCTOR RATINGS                                     */}
        {/* ========================================================================= */}
        {activeSection === "feedback" && <FeedbackReviewManager userRole={user.role} />}

        {/* ========================================================================= */}
        {/* 6. DEPARTMENT MANAGEMENT                                                  */}
        {/* ========================================================================= */}
        {activeSection === "departments" && isAdmin && <DepartmentManager />}

        {/* ========================================================================= */}
        {/* 6B. MULTI-HOSPITAL NETWORK MANAGEMENT                                     */}
        {/* ========================================================================= */}
        {activeSection === "hospitals" && isAdmin && (
          <HospitalManagement
            onSelectHospitalBranch={(hospId) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("careconnect_selected_hospital", hospId);
                window.dispatchEvent(
                  new CustomEvent("hospital-selection-change", { detail: { hospitalId: hospId } })
                );
              }
              handleSelectSection("staff_doctors");
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* 7. COMBINED STAFF & DOCTOR MANAGEMENT (UNIFIED!)                          */}
        {/* ========================================================================= */}
        {(activeSection === "staff_doctors" || activeSection === "doctors" || activeSection === "staff") && (
          <StaffDoctorManager readOnly={isReceptionist} />
        )}

        {/* ========================================================================= */}
        {/* 8. ANALYTICS & CSV REPORTS                                                */}
        {/* ========================================================================= */}
        {activeSection === "analytics" && <AnalyticsReports />}

        {/* ========================================================================= */}
        {/* 8B. SYSTEM BACKUP & HEALTH MAINTENANCE                                    */}
        {/* ========================================================================= */}
        {activeSection === "maintenance" && <SystemMaintenanceManager />}

        {/* ========================================================================= */}
        {/* 9. HOSPITAL PROFILE & CONFIG VIEW                                         */}
        {/* ========================================================================= */}
        {activeSection === "settings" && (
          <HospitalProfileView
            hospitalSettings={hospitalSettings}
            userRole={user.role}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
