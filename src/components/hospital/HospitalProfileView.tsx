"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Edit3,
  Award,
  Layers,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HospitalProfileViewProps {
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
  userRole?: string;
}

export function HospitalProfileView({
  hospitalSettings,
  userRole = "SUPER_ADMIN",
}: HospitalProfileViewProps) {
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const fullAddress = [
    hospitalSettings.address?.street,
    hospitalSettings.address?.city,
    hospitalSettings.address?.state,
    hospitalSettings.address?.postalCode,
    hospitalSettings.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Top Profile Header */}
      <div className="bg-[#16324F] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Registered Healthcare Entity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {hospitalSettings.hospitalName}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {hospitalSettings.tagline ||
              "Clinical Queue Coordination & Healthcare Appointments Platform"}
          </p>
        </div>

        {/* Edit Button - Links directly to Onboarding page */}
        {isSuperAdmin && (
          <div className="flex items-center gap-3">
            <Link href="/onboarding">
              <Button className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold gap-2 shadow-sm">
                <Edit3 className="w-4 h-4" />
                <span>Edit Hospital Profile</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Organization Details */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#16324F]">Hospital Information</h3>
              <p className="text-xs text-[#64748B]">Official entity credentials</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#64748B] block font-semibold">Official Name</span>
              <span className="font-bold text-[#16324F] text-sm">{hospitalSettings.hospitalName}</span>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">Motto / Tagline</span>
              <span className="text-[#16324F] font-medium">
                {hospitalSettings.tagline || "Clinical Queue Coordination"}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">Clinical License No.</span>
              <span className="font-mono font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {hospitalSettings.licenseNumber || "HOSP-MED-2026-X1"}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency & Contacts */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#16324F]">Emergency & Helpline</h3>
              <p className="text-xs text-[#64748B]">24x7 Trauma dispatch</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#64748B] block font-semibold">Trauma Hotline</span>
              <a
                href={`tel:${hospitalSettings.emergencyPhone}`}
                className="font-bold text-[#B91C1C] text-sm hover:underline flex items-center gap-1.5 mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{hospitalSettings.emergencyPhone || "+91 44 2800 1000"}</span>
              </a>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">Official Support Email</span>
              <span className="text-[#16324F] font-medium flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{hospitalSettings.contactEmail || "support@careconnect.health"}</span>
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">24x7 Trauma Availability</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 Trauma & Ambulance Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Physical Premises & Location */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#16324F]">Registered Location</h3>
              <p className="text-xs text-[#64748B]">Premises & hospital campus</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#64748B] block font-semibold">Campus Address</span>
              <p className="font-medium text-[#16324F] mt-0.5 leading-relaxed">
                {fullAddress || "100 Healthcare Parkway, Chennai, Tamil Nadu, 600001, India"}
              </p>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">State & Country</span>
              <span className="text-[#16324F] font-medium">
                {hospitalSettings.address?.state || "Tamil Nadu"}, {hospitalSettings.address?.country || "India"}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block font-semibold">Postal Code</span>
              <span className="font-mono font-bold text-[#16324F]">
                {hospitalSettings.address?.postalCode || "600001"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Specializations Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F766E]" />
            <h3 className="text-base font-bold text-[#16324F]">
              Registered Clinical Specialties ({hospitalSettings.departments?.length || 0})
            </h3>
          </div>

          {isSuperAdmin && (
            <Link
              href="/onboarding"
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1"
            >
              <span>Modify in Onboarding</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {hospitalSettings.departments && hospitalSettings.departments.length > 0 ? (
            hospitalSettings.departments.map((dept, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{dept}</span>
              </span>
            ))
          ) : (
            <p className="text-xs text-[#64748B]">No clinical specialties configured yet.</p>
          )}
        </div>
      </div>

      {/* System Governance & Compliance Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#16324F]">Hospital Profile Setup Completed</h4>
            <p className="text-xs text-[#64748B]">
              All details entered during initial onboarding are actively flashed across all portals.
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <Link href="/onboarding">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold gap-2 text-[#0F766E] border-[#0F766E]/30 hover:bg-teal-50"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit via Onboarding</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
