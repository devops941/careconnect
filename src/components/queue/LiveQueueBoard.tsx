"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Users,
  Volume2,
  Tv,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Building2,
  Stethoscope,
  X,
  ArrowLeft,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { Input } from "../ui/Input";

interface QueueTokenItem {
  _id: string;
  tokenNumber: string;
  tokenSequence: number;
  tokenDate: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  doctorId: string;
  departmentName: string;
  departmentId: string;
  opdRoomNo: string;
  priority: "NORMAL" | "EMERGENCY";
  status: "WAITING" | "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED";
  calledAt?: string;
  completedAt?: string;
}

interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  opdRoomNo: string;
}

interface DoctorItem {
  _id: string;
  name: string;
  departmentName: string;
  departmentId: string;
  opdRoomNo: string;
}

interface LiveQueueBoardProps {
  userRole?: string;
  currentDoctorId?: string;
}

export function LiveQueueBoard({ userRole = "ADMIN", currentDoctorId }: LiveQueueBoardProps) {
  const [tokens, setTokens] = useState<QueueTokenItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTvMode, setIsTvMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState<string>(currentDoctorId || "ALL");
  const [isWalkInDrawerOpen, setIsWalkInDrawerOpen] = useState(false);
  const [submittingToken, setSubmittingToken] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInDept, setWalkInDept] = useState("");
  const [walkInDoc, setWalkInDoc] = useState("");
  const [walkInPriority, setWalkInPriority] = useState<"NORMAL" | "EMERGENCY">("NORMAL");

  // Play auditory announcement chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio autoplay may be disabled until interaction
    }
  }, []);

  const fetchQueueData = useCallback(async () => {
    try {
      const res = await fetch("/api/queue");
      const data = await res.json();
      if (data.success) {
        setTokens(data.data || []);
      }
    } catch {
      // Silently retry on next interval
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetadata = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/doctors"),
      ]);
      const deptData = await deptRes.json();
      const docData = await docRes.json();

      if (deptData.success) {
        setDepartments(deptData.data || []);
        if (deptData.data?.length > 0 && !walkInDept) {
          setWalkInDept(deptData.data[0]._id);
        }
      }
      if (docData.success) {
        setDoctors(docData.data || []);
        if (docData.data?.length > 0 && !walkInDoc) {
          setWalkInDoc(docData.data[0]._id);
        }
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval);
  }, [fetchQueueData]);

  // Update token status
  const updateStatus = async (
    tokenId: string,
    newStatus: "CALLED" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED",
    tokenNumber?: string
  ) => {
    try {
      const res = await fetch(`/api/queue/${tokenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Failed to update queue token status");
        return;
      }

      if (newStatus === "CALLED") {
        playChime();
        toast.success(`Now Calling Token ${tokenNumber || "Patient"}`);
      } else {
        toast.success(`Token marked as ${newStatus}`);
      }

      fetchQueueData();
    } catch {
      toast.error("Network error updating token status");
    }
  };

  // Submit walk-in patient token
  const handleIssueWalkInToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInDept || !walkInDoc) {
      toast.error("Please complete patient name, department and doctor");
      return;
    }

    try {
      setSubmittingToken(true);
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: walkInName.trim(),
          patientPhone: walkInPhone.trim(),
          departmentId: walkInDept,
          doctorId: walkInDoc,
          priority: walkInPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Failed to issue token");
        return;
      }

      toast.success(`Token Issued: ${data.data.tokenNumber}`);
      setIsWalkInDrawerOpen(false);
      setWalkInName("");
      setWalkInPhone("");
      fetchQueueData();
    } catch {
      toast.error("Error creating walk-in token");
    } finally {
      setSubmittingToken(false);
    }
  };

  // Filter tokens based on user selection
  const filteredTokens = tokens.filter((t) => {
    if (selectedDept !== "ALL" && t.departmentId !== selectedDept) return false;
    if (selectedDoctor !== "ALL" && t.doctorId !== selectedDoctor) return false;
    return true;
  });

  const waitingTokens = filteredTokens.filter((t) => t.status === "WAITING");
  const calledTokens = filteredTokens.filter((t) => t.status === "CALLED");
  const inConsultTokens = filteredTokens.filter((t) => t.status === "IN_CONSULTATION");
  const completedTokens = filteredTokens.filter((t) => t.status === "COMPLETED");

  // =========================================================================
  // 1. TV WAITING ROOM DISPLAY MODE
  // =========================================================================
  if (isTvMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col p-6 overflow-hidden">
        {/* TV Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Ticket className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>CareConnect Live OPD Queue</span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-sm text-slate-400">
                Please proceed to your consultation room when your token is announced.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTvMode(false)}
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 gap-2 font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit TV View</span>
            </Button>
          </div>
        </div>

        {/* TV Board Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 overflow-hidden">
          {/* NOW CALLING / SERVING - High Visibility */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-5 h-5 animate-bounce" />
                <span>Now Calling & In Consultation</span>
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {calledTokens.length + inConsultTokens.length} Serving
              </span>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max overflow-y-auto pr-2">
              {[...calledTokens, ...inConsultTokens].length === 0 ? (
                <div className="col-span-2 h-64 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-500 text-center p-6">
                  <Clock className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-lg font-bold text-slate-400">All consultation desks ready</p>
                  <p className="text-sm">Next patient token will flash here</p>
                </div>
              ) : (
                [...calledTokens, ...inConsultTokens].map((token) => (
                  <div
                    key={token._id}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between shadow-2xl ${
                      token.status === "CALLED"
                        ? "bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-400 shadow-amber-500/10 ring-4 ring-amber-400/20 animate-pulse"
                        : "bg-slate-800/80 border-teal-500/60 shadow-teal-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                          {token.status === "CALLED" ? (
                            <>
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                              <span>Calling Now</span>
                            </>
                          ) : (
                            <>
                              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                              <span>In Progress</span>
                            </>
                          )}
                        </span>
                        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mt-1">
                          {token.tokenNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-white/10 text-white">
                          {token.opdRoomNo}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-slate-200">{token.patientName}</p>
                        <p className="text-xs text-slate-400">{token.departmentName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-teal-400">{token.doctorName}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NEXT IN LINE QUEUE LIST */}
          <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Next in Line ({waitingTokens.length})</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {waitingTokens.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                  No patients waiting in queue
                </div>
              ) : (
                waitingTokens.map((t, idx) => (
                  <div
                    key={t._id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-500">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-base font-black font-mono text-teal-300">
                          {t.tokenNumber}
                        </span>
                        <p className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
                          {t.patientName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">{t.opdRoomNo}</span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[100px]">
                        {t.doctorName}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FULL-PAGE VIEW: Walk-in Token Generation (NO OVERLAY!)
  if (isWalkInDrawerOpen) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWalkInDrawerOpen(false)}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Queue Board"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                Issue Walk-in OPD Token
              </h2>
              <p className="text-xs text-[#64748B]">
                Generate priority queue token for unscheduled walk-in patients.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsWalkInDrawerOpen(false)}
            className="text-xs font-bold"
          >
            Cancel & Return to Queue
          </Button>
        </div>

        <form onSubmit={handleIssueWalkInToken} className="space-y-6 w-full">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Patient Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="walk-in-name"
                label="Patient Full Name *"
                placeholder="e.g. Anandha Kumar"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                required
              />

              <Input
                id="walk-in-phone"
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Clinical Department & Doctor Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]">Department *</label>
                <select
                  value={walkInDept}
                  onChange={(e) => {
                    setWalkInDept(e.target.value);
                    const firstMatchingDoc = doctors.find((d) => d.departmentId === e.target.value);
                    if (firstMatchingDoc) setWalkInDoc(firstMatchingDoc._id);
                  }}
                  className="w-full text-xs h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-[#16324F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  required
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.opdRoomNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1F2937]">Attending Doctor *</label>
                <select
                  value={walkInDoc}
                  onChange={(e) => setWalkInDoc(e.target.value)}
                  className="w-full text-xs h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-[#16324F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  required
                >
                  {doctors
                    .filter((d) => !walkInDept || d.departmentId === walkInDept)
                    .map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} - {doc.opdRoomNo}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#1F2937]">Triage Priority *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWalkInPriority("NORMAL")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      walkInPriority === "NORMAL"
                        ? "bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]"
                        : "bg-white text-[#64748B] border-[#E2E8F0]"
                    }`}
                  >
                    Normal Routine
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInPriority("EMERGENCY")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      walkInPriority === "EMERGENCY"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-white text-[#64748B] border-[#E2E8F0]"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Emergency / High Priority</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsWalkInDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={submittingToken}
              className="bg-[#0F766E] hover:bg-[#115E59] font-bold text-xs px-6"
            >
              {submittingToken ? "Generating..." : "Print & Issue Token"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // 2. STANDARD CLINICAL MANAGEMENT BOARD
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#16324F] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#0F766E]" />
            <span>Digital Token & Queue Console</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Real-time patient triage, OPD token calling, and room dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#16324F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Doctor Filter */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#16324F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} ({doc.departmentName})
              </option>
            ))}
          </select>

          {/* TV Display Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTvMode(true)}
            className="gap-1.5 text-xs text-[#16324F] hover:bg-[#F1F5F9]"
            title="Launch Fullscreen Waiting Room TV View"
          >
            <Tv className="w-4 h-4 text-[#0F766E]" />
            <span className="hidden sm:inline">Waiting Room TV</span>
          </Button>

          {/* Issue Walk-in Token Button */}
          <Button
            size="sm"
            onClick={() => setIsWalkInDrawerOpen(true)}
            className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-1.5"
          >
            <Ticket className="w-4 h-4" />
            <span>Walk-in Token</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Waiting in Queue</span>
          <p className="text-2xl font-black text-[#16324F]">{waitingTokens.length}</p>
          <span className="text-[11px] text-[#0F766E]">Next to be called</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase">Now Calling</span>
          <p className="text-2xl font-black text-amber-700">{calledTokens.length}</p>
          <span className="text-[11px] text-amber-700">At consultation room</span>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/60 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#0F766E] uppercase">In Consultation</span>
          <p className="text-2xl font-black text-[#0F766E]">{inConsultTokens.length}</p>
          <span className="text-[11px] text-[#0F766E]">Under clinical care</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Completed Today</span>
          <p className="text-2xl font-black text-emerald-700">{completedTokens.length}</p>
          <span className="text-[11px] text-emerald-700">Consultations finished</span>
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#16324F]">Active Triage Queue</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E]">
              {filteredTokens.length} Total Tokens
            </span>
          </div>

          <button
            onClick={fetchQueueData}
            className="text-xs text-[#64748B] hover:text-[#0F766E] flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">Loading live queue tokens...</div>
        ) : filteredTokens.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#16324F]">No Active Tokens Found</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Issue a walk-in token or check-in scheduled appointment patients to begin triage.
            </p>
            <Button
              size="sm"
              onClick={() => setIsWalkInDrawerOpen(true)}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold"
            >
              Issue First Token
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Department & Doctor</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Est. Wait</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredTokens.map((token) => (
                  <tr
                    key={token._id}
                    className={`transition-colors ${
                      token.status === "CALLED"
                        ? "bg-amber-50/70"
                        : token.status === "IN_CONSULTATION"
                        ? "bg-teal-50/40"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-black text-sm text-[#0F766E]">
                      {token.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#16324F]">{token.patientName}</div>
                      {token.patientPhone && (
                        <div className="text-[11px] text-[#64748B]">{token.patientPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#16324F]">{token.departmentName}</div>
                      <div className="text-[11px] text-[#0F766E]">{token.doctorName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#16324F]">{token.opdRoomNo}</td>
                    <td className="py-3.5 px-4">
                      {token.priority === "EMERGENCY" ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-700 border border-red-200">
                          EMERGENCY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {token.status === "WAITING" ? (
                        (() => {
                          const pos = waitingTokens.findIndex((t) => t._id === token._id);
                          const waitMin = Math.max(5, (pos >= 0 ? pos : 0) * 10);
                          return (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ~{waitMin} mins
                            </span>
                          );
                        })()
                      ) : token.status === "CALLED" ? (
                        <span className="text-[10px] font-bold text-amber-700 animate-pulse">
                          Calling Now
                        </span>
                      ) : token.status === "IN_CONSULTATION" ? (
                        <span className="text-[10px] font-bold text-teal-700">
                          In Room
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Done</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={token.status}
                        labelMap={{
                          WAITING: "Waiting",
                          CALLED: "Calling Room",
                          IN_CONSULTATION: "In Consult",
                          COMPLETED: "Completed",
                          SKIPPED: "Skipped",
                        }}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {token.status === "WAITING" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(token._id, "CALLED", token.tokenNumber)}
                            className="bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs px-2.5 gap-1 font-bold"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </Button>
                        )}

                        {token.status === "CALLED" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(token._id, "IN_CONSULTATION")}
                            className="bg-[#0F766E] hover:bg-[#115E59] text-white h-7 text-xs px-2.5 gap-1 font-bold"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start</span>
                          </Button>
                        )}

                        {token.status === "IN_CONSULTATION" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(token._id, "COMPLETED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2.5 gap-1 font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Finish</span>
                          </Button>
                        )}

                        {token.status !== "COMPLETED" && token.status !== "SKIPPED" && (
                          <button
                            onClick={() => updateStatus(token._id, "SKIPPED")}
                            className="text-[11px] text-[#64748B] hover:text-[#B91C1C] px-2 py-1 rounded-md hover:bg-red-50"
                            title="Skip patient / No show"
                          >
                            Skip
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
