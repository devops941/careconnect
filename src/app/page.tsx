import Link from "next/link";
import {
  Activity,
  Calendar,
  CreditCard,
  Clock,
  PhoneCall,
  MapPin,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#1E293B]">
      {/* =========================================================
          SECTION 1: HERO & OUTPATIENT COORDINATION
          ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#E6F4F2] via-[#F0FDF4]/30 to-[#F8FAFC] border-b border-[#E2E8F0] overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0F766E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#16324F]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Navigation Bar */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-[#E2E8F0]/60">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#16324F]">
                Care<span className="text-[#0F766E]">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-[#64748B] px-2 py-0.5 bg-white/70 rounded-md border border-[#E2E8F0]">
                Hospital Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="tel:+919876543210"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] bg-white px-3 py-1.5 rounded-lg border border-[#CCFBF1] shadow-xs hover:bg-[#F0FDFA] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>24/7 Helpline: +91 98765 43210</span>
            </Link>

            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold bg-white">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold bg-[#0F766E] hover:bg-[#0D655E]">
                Register
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#0F766E] text-xs font-bold border border-[#99F6E4] shadow-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Smart Outpatient Healthcare • Live Queue Tracking Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#16324F] tracking-tight leading-[1.15]">
            Smart Healthcare, <br />
            <span className="text-[#0F766E]">Zero Waiting Lines.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Experience seamless hospital visits with real-time digital token tracking,
            specialist doctor consultations, and instant paperless billing.
          </p>

          {/* Call to Actions - Spacious, Single Line, No Text Wrapping */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-w-[230px] px-8 py-3.5 gap-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-md text-sm sm:text-base font-semibold"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Patient Portal & Booking</span>
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[230px] px-8 py-3.5 gap-2.5 bg-white text-[#16324F] border-[#CBD5E1] hover:bg-[#F1F5F9] text-sm sm:text-base font-semibold shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Hospital Staff Sign In</span>
              </Button>
            </Link>
          </div>

          {/* Quick Key Highlights */}
          <div className="mt-12 pt-8 border-t border-[#E2E8F0]/70 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-[#475569]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <span>Real-Time Digital Token Display</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <span>5+ Multi-Specialty OPD Clinics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <span>Instant UPI & Cashless Billing</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: 3 CORE CLINICAL SERVICES (PILLARS)
          ========================================================= */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-wider text-[#0F766E] mb-2">
              Comprehensive Care
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Three Pillars of CareConnect
            </p>
            <p className="text-sm text-[#64748B] mt-2">
              Designed specifically for patient convenience and streamlined clinical workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-7 transition-all hover:shadow-md hover:border-[#CBD5E1] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center mb-5">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-[#16324F] mb-2">
                  Digital Queue & Token Broadcast
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                  Track your position in the OPD queue live on your smartphone or waiting hall TV display.
                  Algorithmic wait-time estimations ensure zero endless waiting in crowded rooms.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[#E2E8F0] text-xs font-medium text-[#475569]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                  <span>Real-Time Waiting Hall TV Display</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                  <span>Automated Wait Time Estimation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                  <span>Walk-in & Digital Token Generation</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-7 transition-all hover:shadow-md hover:border-[#CBD5E1] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                  <Stethoscope className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-[#16324F] mb-2">
                  Specialist Doctor Consultations
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                  Book verified specialists across Cardiology, Neurology, Pediatrics, Orthopedics, and General Medicine.
                  Receive digital prescriptions directly in your patient dashboard.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[#E2E8F0] text-xs font-medium text-[#475569]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Verified Medical Specialists</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Doctor Shift & Leave Schedule Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Instant Paperless Digital Prescriptions</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-7 transition-all hover:shadow-md hover:border-[#CBD5E1] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                  <CreditCard className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold text-[#16324F] mb-2">
                  Transparent Billing & Invoicing
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                  Transparent consultation fees with zero hidden charges. Pay seamlessly via UPI QR code,
                  debit/credit card, or reception counter, with instant itemized tax receipts.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[#E2E8F0] text-xs font-medium text-[#475569]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>UPI QR Code & Online Payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Downloadable Itemized PDF Receipts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Reception Cash & Card Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: CLEAN & MINIMAL HOSPITAL FOOTER
          ========================================================= */}
      <footer className="bg-[#0F172A] text-[#94A3B8] border-t border-[#1E293B]">
        {/* Compact Info Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1E293B]">
            {/* Hospital Brand & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Care<span className="text-[#2DD4BF]">Connect</span>
                </span>
                <p className="text-xs text-[#64748B]">Smart Hospital Outpatient & Queue System</p>
              </div>
            </div>

            {/* Minimal Essential Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>24x7 Emergency: <strong className="text-white">+91 98765 43210</strong></span>
              </div>
              <span className="text-[#334155] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>OPD: <strong className="text-white">08:30 AM – 08:30 PM</strong></span>
              </div>
              <span className="text-[#334155] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Healthcare Blvd, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Navigation Links */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} CareConnect Health Systems. All rights reserved.</p>

            <div className="flex items-center gap-5 font-medium">
              <Link href="/login" className="hover:text-white transition-colors">
                Patient Portal
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Staff Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
