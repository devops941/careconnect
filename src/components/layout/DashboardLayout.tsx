"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PhoneCall,
  Stethoscope,
  BarChart3,
  Ticket,
  ClipboardList,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { ProfilePreferencesModal } from "../profile/ProfilePreferencesModal";

export interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  href?: string;
  superAdminOnly?: boolean;
}

interface DashboardLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    identityType?: string;
    status?: string;
    department?: string;
  };
  hospitalName?: string;
  emergencyPhone?: string;
  emergency24x7?: boolean;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
  customNavItems?: NavItem[];
  quickAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  hospitalName = "CareConnect Health Systems",
  emergencyPhone = "+91 44 2800 1000",
  emergency24x7 = true,
  activeSection = "overview",
  onSelectSection,
  customNavItems,
  quickAction,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Desktop sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Profile & Preferences Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout error. Redirecting...");
      router.push("/login");
    }
  };

  const isPatient = user.role === "PATIENT";

  // Default fallback navigation items if not custom-supplied
  const defaultNavItems: NavItem[] = isPatient
    ? [
        { id: "overview", title: "Patient Overview", icon: LayoutDashboard },
        { id: "queue", title: "My Live Ticket", icon: Clock, badge: "Live" },
        { id: "appointments", title: "My Appointments", icon: CalendarCheck2 },
        { id: "prescriptions", title: "Prescriptions & Vault", icon: ClipboardList },
        { id: "doctors", title: "Specialists & Doctors", icon: Stethoscope },
      ]
    : [
        { id: "overview", title: "Operations Hub", icon: LayoutDashboard },
        ...(user.role === "DOCTOR"
          ? [{ id: "consultation", title: "Consultation & Rx Pad", icon: Stethoscope }]
          : []),
        // { id: "queue", title: "Live Queue & TV", icon: Clock, badge: "Live" },
        { id: "appointments", title: "Appointments Desk", icon: CalendarCheck2 },
        ...(user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? [
              { id: "departments", title: "Departments", icon: Building2 },
              { id: "doctors", title: "Doctors Directory", icon: Stethoscope },
              { id: "staff", title: "Staff Provisioning", icon: Users },
            ]
          : []),
        ...(user.role === "RECEPTIONIST"
          ? [{ id: "doctors", title: "Doctors Directory", icon: Stethoscope }]
          : []),
        { id: "analytics", title: "Analytics & Reports", icon: BarChart3 },
        ...(user.role === "SUPER_ADMIN"
          ? [{ id: "settings", title: "Hospital Profile", icon: Building2, href: "/onboarding" }]
          : []),
      ];

  const effectiveNavItems = (customNavItems || defaultNavItems).filter(
    (item) => !item.superAdminOnly || user.role === "SUPER_ADMIN"
  );

  const currentNav = effectiveNavItems.find((n) => n.id === activeSection) || effectiveNavItems[0];

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (onSelectSection) {
      onSelectSection(item.id);
    }
    setIsMobileOpen(false);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-[#16324F] text-white border-[#16324F]";
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DOCTOR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RECEPTIONIST":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PATIENT":
      default:
        return "bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] flex">
      {/* ========================================================================= */}
      {/* 1. Mobile Backdrop Overlay & Drawer                                      */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#16324F] text-white flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-sm leading-tight block truncate max-w-[170px]">
                {hospitalName}
              </span>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold block">
                {isPatient ? "Patient Portal" : "Clinical Operations"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {effectiveNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0F766E] text-white shadow-xs font-bold"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#CCFBF1]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Footer User Card */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0F766E] flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold truncate">{user.name}</span>
              <span className="block text-[11px] text-[#94A3B8] truncate">{user.email}</span>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. Desktop Collapsible Sidebar                                            */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col bg-[#16324F] text-white transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 shrink-0 border-r border-white/5 ${
          isCollapsed ? "w-20" : "w-[292px]"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="overflow-hidden whitespace-nowrap min-w-0 flex-1">
                  <span className="font-bold text-[13.5px] leading-tight block text-white truncate" title={hospitalName}>
                    {hospitalName}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold block">
                    {isPatient ? "Patient Portal" : "Clinical Suite"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors focus:outline-none shrink-0 ml-1"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-[#0F766E] hover:bg-[#115E59] flex items-center justify-center text-white transition-all shadow-sm group"
                title="Expand sidebar"
              >
                <Activity className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items (Clean List with all options) */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          {effectiveNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? "bg-[#0F766E] text-white shadow-sm font-bold"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
                title={isCollapsed ? item.title : undefined}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? "text-white scale-110" : "text-[#94A3B8] group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate whitespace-nowrap text-left">{item.title}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-white/20 text-white" : "bg-white/10 text-[#CCFBF1]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip on collapsed hover */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16324F] text-white text-xs font-semibold rounded-lg shadow-xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10">
          {!isCollapsed ? (
            <div className="space-y-2.5">
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all group"
                title="View Profile & Preferences"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F766E] flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:scale-105 transition-transform">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden leading-tight flex-1">
                  <span className="block text-xs font-bold text-white truncate group-hover:text-[#CCFBF1]">{user.name}</span>
                  <span className="block text-[10px] text-[#94A3B8] truncate">{user.role} • Profile</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs text-[#94A3B8] hover:text-[#B91C1C] hover:border-[#FCA5A5] bg-transparent border-white/10 font-bold"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-xl text-[#94A3B8] hover:text-[#B91C1C] hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. Main Viewport Area with Rich Top Header                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Minimal Clean Top Navbar */}
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between shadow-xs">
          {/* Left: Mobile Button & Section Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#16324F] hover:bg-[#F1F5F9] focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-bold text-[#16324F] tracking-tight">
              {currentNav?.title || "Dashboard"}
            </h1>
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#16324F] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <span className="block text-xs font-bold text-[#16324F] truncate max-w-[130px]">
                {user.name}
              </span>
              <span className="block text-[10px] text-[#64748B] font-medium">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-[#E2E8F0] py-4 text-center text-xs text-[#94A3B8]">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              © {new Date().getFullYear()} <strong>{hospitalName}</strong> • Digital Hospital & Queue Suite
            </span>
            <span>Emergency Hotline: {emergencyPhone}</span>
          </div>
        </footer>
      </div>

      {/* Profile & Security Preferences Modal */}
      {isProfileModalOpen && (
        <ProfilePreferencesModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
