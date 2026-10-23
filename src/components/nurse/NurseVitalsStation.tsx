"use client";

import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Stethoscope,
  Clock,
  Thermometer,
  Scale,
  Flame,
  FileText,
  AlertCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";

interface QueuePatientToken {
  _id: string;
  tokenNumber: string;
  tokenSequence: number;
  tokenDate: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  doctorId: string;
  departmentName: string;
  opdRoomNo: string;
  priority: "NORMAL" | "EMERGENCY";
  status: string;
  vitalsStatus?: "PENDING" | "RECORDED";
  vitals?: {
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    bmiCategory?: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    bpFormatted?: string;
    pulseBpm?: number;
    tempFahrenheit?: number;
    spo2Percent?: number;
    respiratoryRate?: number;
    rbsMgDl?: number;
    allergies?: string;
    chiefComplaints?: string;
    nurseNotes?: string;
    recordedByNurseName?: string;
    recordedAt?: string;
  };
}

interface NurseVitalsStationProps {
  nurseName?: string;
}

export function NurseVitalsStation({ nurseName = "Duty Nurse" }: NurseVitalsStationProps) {
  const [tokens, setTokens] = useState<QueuePatientToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<QueuePatientToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RECORDED">("ALL");

  // Vitals Form States
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [bpSystolic, setBpSystolic] = useState<string>("");
  const [bpDiastolic, setBpDiastolic] = useState<string>("");
  const [pulseBpm, setPulseBpm] = useState<string>("");
  const [tempFahrenheit, setTempFahrenheit] = useState<string>("");
  const [spo2Percent, setSpo2Percent] = useState<string>("");
  const [respiratoryRate, setRespiratoryRate] = useState<string>("");
  const [rbsMgDl, setRbsMgDl] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("None Reported");
  const [chiefComplaints, setChiefComplaints] = useState<string>("");
  const [nurseNotes, setNurseNotes] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/queue");
      const data = await res.json();
      if (res.ok && data.success) {
        const tokenList: QueuePatientToken[] = data.data || [];
        setTokens(tokenList);

        // Auto-select first pending token if none selected
        if (!selectedToken && tokenList.length > 0) {
          const firstPending = tokenList.find((t) => t.vitalsStatus !== "RECORDED") || tokenList[0];
          handleSelectToken(firstPending);
        } else if (selectedToken) {
          const refreshed = tokenList.find((t) => t._id === selectedToken._id);
          if (refreshed) setSelectedToken(refreshed);
        }
      }
    } catch {
      toast.error("Failed to load queue tokens.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleSelectToken = (token: QueuePatientToken) => {
    setSelectedToken(token);
    if (token.vitals) {
      setHeightCm(token.vitals.heightCm ? String(token.vitals.heightCm) : "");
      setWeightKg(token.vitals.weightKg ? String(token.vitals.weightKg) : "");
      setBpSystolic(token.vitals.bpSystolic ? String(token.vitals.bpSystolic) : "");
      setBpDiastolic(token.vitals.bpDiastolic ? String(token.vitals.bpDiastolic) : "");
      setPulseBpm(token.vitals.pulseBpm ? String(token.vitals.pulseBpm) : "");
      setTempFahrenheit(token.vitals.tempFahrenheit ? String(token.vitals.tempFahrenheit) : "");
      setSpo2Percent(token.vitals.spo2Percent ? String(token.vitals.spo2Percent) : "");
      setRespiratoryRate(token.vitals.respiratoryRate ? String(token.vitals.respiratoryRate) : "");
      setRbsMgDl(token.vitals.rbsMgDl ? String(token.vitals.rbsMgDl) : "");
      setAllergies(token.vitals.allergies || "None Reported");
      setChiefComplaints(token.vitals.chiefComplaints || "");
      setNurseNotes(token.vitals.nurseNotes || "");
    } else {
      // Clear form for fresh vitals entry
      setHeightCm("");
      setWeightKg("");
      setBpSystolic("120");
      setBpDiastolic("80");
      setPulseBpm("72");
      setTempFahrenheit("98.6");
      setSpo2Percent("98");
      setRespiratoryRate("16");
      setRbsMgDl("");
      setAllergies("None Reported");
      setChiefComplaints("");
      setNurseNotes("");
    }
  };

  // Real-time BMI calculation
  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  let liveBmi: number | null = null;
  let bmiCategory = "";
  let bmiColor = "text-slate-600 bg-slate-100 border-slate-200";

  if (heightNum > 0 && weightNum > 0) {
    const heightM = heightNum / 100;
    liveBmi = Number((weightNum / (heightM * heightM)).toFixed(1));
    if (liveBmi < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "text-blue-700 bg-blue-50 border-blue-200";
    } else if (liveBmi <= 24.9) {
      bmiCategory = "Normal Weight";
      bmiColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (liveBmi <= 29.9) {
      bmiCategory = "Overweight";
      bmiColor = "text-amber-700 bg-amber-50 border-amber-200";
    } else {
      bmiCategory = "Obese";
      bmiColor = "text-rose-700 bg-rose-50 border-rose-200";
    }
  }

  // Real-time Blood Pressure assessment
  const sysNum = Number(bpSystolic);
  const diaNum = Number(bpDiastolic);
  let bpCategory = "";
  let bpBadgeColor = "text-slate-600 bg-slate-100 border-slate-200";

  if (sysNum > 0 && diaNum > 0) {
    if (sysNum < 120 && diaNum < 80) {
      bpCategory = "Optimal BP";
      bpBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (sysNum <= 129 && diaNum < 80) {
      bpCategory = "Elevated";
      bpBadgeColor = "text-amber-700 bg-amber-50 border-amber-200";
    } else if (sysNum <= 139 || diaNum <= 89) {
      bpCategory = "Stage 1 HTN";
      bpBadgeColor = "text-orange-700 bg-orange-50 border-orange-200";
    } else {
      bpCategory = "Stage 2 HTN";
      bpBadgeColor = "text-rose-700 bg-rose-50 border-rose-200";
    }
  }

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      toast.error("Please select a patient token first.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        tokenId: selectedToken._id,
        heightCm: heightNum || undefined,
        weightKg: weightNum || undefined,
        bpSystolic: sysNum || undefined,
        bpDiastolic: diaNum || undefined,
        pulseBpm: Number(pulseBpm) || undefined,
        tempFahrenheit: Number(tempFahrenheit) || undefined,
        spo2Percent: Number(spo2Percent) || undefined,
        respiratoryRate: Number(respiratoryRate) || undefined,
        rbsMgDl: Number(rbsMgDl) || undefined,
        allergies: allergies.trim() || "None Reported",
        chiefComplaints: chiefComplaints.trim() || undefined,
        nurseNotes: nurseNotes.trim() || undefined,
      };

      const res = await fetch("/api/queue/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to record vitals.");
      }

      toast.success(
        `Vitals recorded successfully for Token ${selectedToken.tokenNumber}! Ready for ${selectedToken.doctorName}.`
      );
      await fetchTokens();
    } catch (err: any) {
      toast.error(err.message || "Failed to save vitals.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTokens = tokens.filter((t) => {
    if (statusFilter === "PENDING" && t.vitalsStatus === "RECORDED") return false;
    if (statusFilter === "RECORDED" && t.vitalsStatus !== "RECORDED") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchToken = t.tokenNumber.toLowerCase().includes(q);
      const matchName = t.patientName.toLowerCase().includes(q);
      const matchDoc = t.doctorName.toLowerCase().includes(q);
      const matchDept = t.departmentName.toLowerCase().includes(q);
      return matchToken || matchName || matchDoc || matchDept;
    }
    return true;
  });

  const pendingCount = tokens.filter((t) => t.vitalsStatus !== "RECORDED").length;
  const recordedCount = tokens.filter((t) => t.vitalsStatus === "RECORDED").length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Header Banner & Quick Metrics                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 border border-teal-200">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#16324F]">OPD Pre-Consultation Vitals & Triage Station</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Nurse Station
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Record patient anthropometry, cardiovascular vitals, oxygen saturation, and allergy alerts before doctor consultation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTokens}
            className="text-xs font-semibold h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh Queue</span>
          </Button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Today&apos;s Active OPD Queue</span>
          <p className="text-2xl font-extrabold text-[#16324F] mt-1">{tokens.length} Patients</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Awaiting Vitals Check</span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount} Pending</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Ready for Doctor Consultation</span>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{recordedCount} Recorded ✓</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Main Two-Column Layout: Queue on Left | Vitals Form on Right           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Queue Patient Token List (4 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="border-b border-[#F1F5F9] pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E]" />
                <span>Today&apos;s Triage Queue</span>
              </h3>
              <span className="text-xs font-semibold text-[#64748B]">
                {filteredTokens.length} Tokens
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(["ALL", "PENDING", "RECORDED"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStatusFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === mode
                      ? "bg-[#16324F] text-white shadow-2xs"
                      : "bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] border border-[#E2E8F0]"
                  }`}
                >
                  {mode === "ALL" ? "All" : mode === "PENDING" ? "🟡 Pending" : "🟢 Recorded"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search token # or patient name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] font-medium"
              />
            </div>
          </div>

          {/* Tokens List */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
                <span>Loading triage queue...</span>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#16324F]">No Patients in this View</p>
                <p className="text-[11px] text-[#64748B]">
                  No patients awaiting triage match your selected filter.
                </p>
              </div>
            ) : (
              filteredTokens.map((t) => {
                const isSelected = selectedToken?._id === t._id;
                const isRecorded = t.vitalsStatus === "RECORDED";
                return (
                  <div
                    key={t._id}
                    onClick={() => handleSelectToken(t)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                        : "bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="overflow-hidden leading-snug">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-[#0F766E]">
                          {t.tokenNumber}
                        </span>
                        {t.priority === "EMERGENCY" && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                            Emergency
                          </span>
                        )}
                      </div>
                      <span className="block text-xs font-bold text-[#16324F] truncate mt-0.5">
                        {t.patientName}
                      </span>
                      <span className="block text-[11px] text-[#64748B] truncate">
                        {t.doctorName} • {t.departmentName}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      {isRecorded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Recorded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <span>Pending</span>
                        </span>
                      )}
                      <span className="block text-[10px] text-[#94A3B8] mt-1">
                        Room {t.opdRoomNo}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Vitals Entry Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          {selectedToken ? (
            <form onSubmit={handleSaveVitals} className="space-y-6">
              {/* Patient Banner */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center font-bold font-mono text-sm">
                    {selectedToken.tokenNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#16324F]">{selectedToken.patientName}</h3>
                    <p className="text-xs text-[#64748B]">
                      Doctor: <strong>{selectedToken.doctorName}</strong> • {selectedToken.departmentName} ({selectedToken.opdRoomNo})
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  {selectedToken.vitalsStatus === "RECORDED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for Doctor</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span>Awaiting Vitals Entry</span>
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 1: Anthropometry & Live BMI */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#0F766E]" />
                    <span>1. Body Anthropometry & BMI</span>
                  </h4>
                  {liveBmi !== null && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiColor}`}>
                      BMI: {liveBmi} kg/m² • {bmiCategory}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Patient Height (cm)"
                    type="number"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 170"
                    required
                  />
                  <Input
                    label="Patient Weight (kg)"
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 68.5"
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: Cardiovascular & Respiratory Vitals */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0F766E]" />
                    <span>2. Cardiovascular & Oxygen Status</span>
                  </h4>
                  {bpCategory && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bpBadgeColor}`}>
                      BP: {sysNum}/{diaNum} mmHg • {bpCategory}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Systolic BP (mmHg)"
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="120"
                    required
                  />
                  <Input
                    label="Diastolic BP (mmHg)"
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="80"
                    required
                  />
                  <Input
                    label="Pulse Rate (bpm)"
                    type="number"
                    value={pulseBpm}
                    onChange={(e) => setPulseBpm(e.target.value)}
                    placeholder="72"
                    required
                  />
                  <Input
                    label="Oxygen SpO2 (%)"
                    type="number"
                    value={spo2Percent}
                    onChange={(e) => setSpo2Percent(e.target.value)}
                    placeholder="98"
                    required
                  />
                </div>
              </div>

              {/* SECTION 3: General & Metabolic Checks */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#0F766E]" />
                  <span>3. Temperature & Blood Sugar</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Temperature (°F)"
                    type="number"
                    step="0.1"
                    value={tempFahrenheit}
                    onChange={(e) => setTempFahrenheit(e.target.value)}
                    placeholder="98.6"
                    required
                  />
                  <Input
                    label="Respiratory Rate (min)"
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    placeholder="16"
                  />
                  <Input
                    label="Random Glucose (mg/dL)"
                    type="number"
                    value={rbsMgDl}
                    onChange={(e) => setRbsMgDl(e.target.value)}
                    placeholder="e.g. 110 (Optional)"
                  />
                </div>
              </div>

              {/* SECTION 4: Clinical Safety Alert - Known Drug Allergies */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <label className="text-xs font-bold uppercase tracking-wider block">
                    Critical Safety Alert: Known Drug Allergies *
                  </label>
                </div>
                <Input
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Paracetamol (or 'None Reported')"
                  className="bg-white"
                  required
                />
                <p className="text-[11px] text-rose-700">
                  This allergy note is highlighted in red on the Doctor&apos;s Prescription Pad to avoid dangerous drug interactions.
                </p>
              </div>

              {/* SECTION 5: Chief Complaints & Nurse Observations */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>4. Patient Chief Complaints & Triage Notes</span>
                </h4>

                <div className="space-y-3">
                  <Input
                    label="Chief Complaints & Symptoms"
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    placeholder="e.g. High fever for 3 days, persistent dry cough, chest tightness"
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F2937] block">
                      Nurse Observations / Triage Notes
                    </label>
                    <textarea
                      rows={2}
                      value={nurseNotes}
                      onChange={(e) => setNurseNotes(e.target.value)}
                      placeholder="e.g. Patient is conscious, oriented. Mild dehydration observed. Advised oral rehydration."
                      className="w-full p-3 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F766E] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                <span className="text-[11px] text-[#64748B]">
                  Logged by: <strong>{nurseName}</strong>
                </span>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs px-8 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Saving Vitals...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>Save & Mark Ready for Doctor</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-20 text-center space-y-3">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#16324F]">Select a Patient Token</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Click any patient from the left queue to measure and record clinical vitals before their consultation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
