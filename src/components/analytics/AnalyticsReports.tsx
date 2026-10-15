"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  CalendarCheck2,
  Ticket,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";

interface AnalyticsData {
  today: string;
  appointments: {
    total: number;
    today: number;
    completed: number;
    cancelled: number;
  };
  queue: {
    todayTotal: number;
    waiting: number;
    completed: number;
  };
  counts: {
    doctors: number;
    departments: number;
    patients: number;
  };
  departmentStats: Array<{
    _id: string;
    name: string;
    code: string;
    appointmentCount: number;
  }>;
}

export function AnalyticsReports() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      toast.error("Unable to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDownloadCsv = (type: "appointments" | "queue") => {
    window.open(`/api/reports/export-csv?type=${type}`, "_blank");
    toast.success(`Exporting ${type} CSV report...`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-xs text-[#64748B]">
        Generating clinical analytics & metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#16324F] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0F766E]" />
            <span>Clinical Analytics & Operational Reports</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Real-time outpatient metrics, queue volume, and exportable CSV audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadCsv("appointments")}
            className="text-xs font-bold gap-1.5 border-[#E2E8F0] text-[#16324F] hover:bg-[#F8FAFC]"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
            <span>Export Appointments CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleDownloadCsv("queue")}
            className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Queue CSV</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase">Today&apos;s Appointments</span>
          <p className="text-3xl font-black text-[#16324F]">{data?.appointments.today || 0}</p>
          <span className="text-xs text-[#0F766E] font-medium">
            {data?.appointments.total || 0} Total Lifetime
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase">Consults Completed</span>
          <p className="text-3xl font-black text-[#15803D]">{data?.appointments.completed || 0}</p>
          <span className="text-xs text-[#64748B] font-medium">Successfully discharged</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase">Today&apos;s OPD Tokens</span>
          <p className="text-3xl font-black text-[#0F766E]">{data?.queue.todayTotal || 0}</p>
          <span className="text-xs text-[#64748B] font-medium">
            {data?.queue.waiting || 0} In Waiting Queue
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1">
          <span className="text-xs font-bold text-[#64748B] uppercase">Active Clinical Team</span>
          <p className="text-3xl font-black text-[#16324F]">{data?.counts.doctors || 0}</p>
          <span className="text-xs text-[#64748B] font-medium">
            Across {data?.counts.departments || 0} Specializations
          </span>
        </div>
      </div>

      {/* Department Distribution Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#16324F] flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-[#0F766E]" />
          <span>Department-wise Patient Caseload</span>
        </h3>

        <div className="space-y-3 pt-2">
          {data?.departmentStats && data.departmentStats.length > 0 ? (
            data.departmentStats.map((dept) => {
              const maxCount = Math.max(...data.departmentStats.map((d) => d.appointmentCount), 1);
              const percentage = Math.round((dept.appointmentCount / maxCount) * 100);

              return (
                <div key={dept._id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#16324F]">
                      {dept.name} <span className="text-[#64748B]">({dept.code})</span>
                    </span>
                    <span className="text-[#0F766E]">{dept.appointmentCount} Appointments</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[#64748B] py-4">No department caseload recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
