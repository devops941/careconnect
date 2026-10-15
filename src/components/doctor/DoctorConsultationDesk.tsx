"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Ticket,
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  HeartPulse,
  Printer,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { SlideDrawer } from "../ui/SlideDrawer";

interface MedicationEntry {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ActiveQueueToken {
  _id: string;
  tokenNumber: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  doctorName: string;
  departmentName: string;
  opdRoomNo: string;
  status: string;
  appointmentId?: string;
}

interface DoctorConsultationDeskProps {
  doctorName: string;
  doctorId: string;
  departmentName: string;
}

export function DoctorConsultationDesk({
  doctorName,
  doctorId,
  departmentName,
}: DoctorConsultationDeskProps) {
  const [tokens, setTokens] = useState<ActiveQueueToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<ActiveQueueToken | null>(null);
  const [loading, setLoading] = useState(true);

  // Digital Rx Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [bp, setBp] = useState("120/80");
  const [pulse, setPulse] = useState("72 bpm");
  const [temp, setTemp] = useState("98.6 °F");
  const [weight, setWeight] = useState("68 kg");
  const [followUpDate, setFollowUpDate] = useState("");
  const [labTests, setLabTests] = useState("");
  const [medications, setMedications] = useState<MedicationEntry[]>([
    {
      medicineName: "Paracetamol 650mg",
      dosage: "1 Tab",
      frequency: "1-0-1",
      duration: "3 Days",
      instructions: "After meals",
    },
  ]);
  const [savingRx, setSavingRx] = useState(false);
  const [prescriptionSlip, setPrescriptionSlip] = useState<any | null>(null);

  const fetchDoctorTokens = async () => {
    try {
      const res = await fetch("/api/queue");
      const data = await res.json();
      if (data.success) {
        const queueList: ActiveQueueToken[] = data.data || [];
        setTokens(queueList);
        // If there's an in-consultation or called token, select it automatically
        const active = queueList.find(
          (t) => t.status === "IN_CONSULTATION" || t.status === "CALLED"
        );
        if (active && !selectedToken) {
          setSelectedToken(active);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorTokens();
    const interval = setInterval(fetchDoctorTokens, 5000);
    return () => clearInterval(interval);
  }, []);

  const addMedicationRow = () => {
    setMedications([
      ...medications,
      {
        medicineName: "",
        dosage: "1 Tab",
        frequency: "1-0-1",
        duration: "5 Days",
        instructions: "After meals",
      },
    ]);
  };

  const removeMedicationRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof MedicationEntry, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) {
      toast.error("Please select a patient from the queue");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Please enter a clinical diagnosis");
      return;
    }

    try {
      setSavingRx(true);
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedToken.patientId || selectedToken._id,
          patientName: selectedToken.patientName,
          doctorId,
          doctorName,
          departmentName,
          appointmentId: selectedToken.appointmentId,
          tokenNumber: selectedToken.tokenNumber,
          diagnosis: diagnosis.trim(),
          clinicalNotes: clinicalNotes.trim(),
          vitals: { bp, pulse, temp, weight },
          medications: medications.filter((m) => m.medicineName.trim().length > 0),
          labInvestigations: labTests
            ? labTests.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          followUpDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Failed to save prescription");
        return;
      }

      toast.success("Consultation Completed & Digital Rx Dispatched!");
      setPrescriptionSlip(data.data);
      // Reset form
      setDiagnosis("");
      setClinicalNotes("");
      setSelectedToken(null);
      fetchDoctorTokens();
    } catch {
      toast.error("Network error submitting prescription");
    } finally {
      setSavingRx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clinician Header Bar */}
      <div className="bg-[#16324F] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Consultation Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Dr. {doctorName}</h2>
          <p className="text-xs text-slate-300">
            {departmentName} • CareConnect Healthcare Digital Pad
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-teal-300">
            {tokens.filter((t) => t.status === "WAITING").length} Patients in Waiting
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Queue Patient Selector */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0F766E]" />
              <span>Attending Patient Queue</span>
            </h3>
            <span className="text-xs font-bold text-[#0F766E]">{tokens.length} Total</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {tokens.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No patients in queue today
              </div>
            ) : (
              tokens.map((token) => {
                const isSelected = selectedToken?._id === token._id;
                return (
                  <div
                    key={token._id}
                    onClick={() => setSelectedToken(token)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#CCFBF1]/30 border-[#0F766E] shadow-xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-black text-sm text-[#0F766E]">
                        {token.tokenNumber}
                      </span>
                      <StatusBadge
                        status={token.status}
                        labelMap={{
                          WAITING: "Waiting",
                          CALLED: "Calling",
                          IN_CONSULTATION: "Consulting",
                          COMPLETED: "Done",
                          SKIPPED: "Skipped",
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-[#16324F]">{token.patientName}</p>
                      <p className="text-[11px] text-[#64748B]">{token.departmentName} • {token.opdRoomNo}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2-Columns: Digital Prescription Pad */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#16324F] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0F766E]" />
                <span>Digital Prescription & Consultation Note</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Record clinical vitals, differential diagnosis, and medicine schedule
              </p>
            </div>

            {selectedToken && (
              <div className="text-right">
                <span className="text-xs font-bold text-[#64748B] block">Current Patient:</span>
                <span className="text-sm font-black text-[#16324F]">
                  {selectedToken.patientName} ({selectedToken.tokenNumber})
                </span>
              </div>
            )}
          </div>

          {!selectedToken ? (
            <div className="p-12 text-center space-y-3 border-2 border-dashed border-[#E2E8F0] rounded-2xl">
              <User className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-[#16324F]">Select a patient from the queue</p>
              <p className="text-xs text-[#64748B]">
                Click any patient on the left panel to begin recording consultation and issue Rx.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCompleteConsultation} className="space-y-6">
              {/* Patient Vitals Grid */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <span className="text-xs font-bold text-[#16324F] flex items-center gap-1.5 uppercase tracking-wider">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Clinical Vitals</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    id="vital-bp"
                    label="Blood Pressure"
                    placeholder="120/80 mmHg"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                  />
                  <Input
                    id="vital-pulse"
                    label="Pulse Rate"
                    placeholder="72 bpm"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                  />
                  <Input
                    id="vital-temp"
                    label="Temperature"
                    placeholder="98.6 °F"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                  />
                  <Input
                    id="vital-weight"
                    label="Body Weight"
                    placeholder="68 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              {/* Diagnosis & Clinical Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="clinical-diagnosis"
                  label="Primary Clinical Diagnosis"
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
                <Input
                  id="clinical-notes"
                  label="Chief Complaints / Doctor Notes"
                  placeholder="Patient reports persistent dry cough for 3 days"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>

              {/* Medication Schedule Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                    Medication Schedule (Rx)
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedicationRow}
                    className="text-xs gap-1 text-[#0F766E] border-[#0F766E]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] items-center text-xs"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Medicine name & strength"
                          value={med.medicineName}
                          onChange={(e) => updateMedication(idx, "medicineName", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white font-medium"
                          required
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1 Tab)"
                          value={med.dosage}
                          onChange={(e) => updateMedication(idx, "dosage", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <select
                          value={med.frequency}
                          onChange={(e) => updateMedication(idx, "frequency", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-white"
                        >
                          <option value="1-0-1">1-0-1 (Morning & Night)</option>
                          <option value="1-1-1">1-1-1 (Thrice daily)</option>
                          <option value="1-0-0">1-0-0 (Morning only)</option>
                          <option value="0-0-1">0-0-1 (Bedtime)</option>
                          <option value="SOS">SOS (As needed)</option>
                        </select>
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Duration (e.g. 5 Days)"
                          value={med.duration}
                          onChange={(e) => updateMedication(idx, "duration", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-1 text-right">
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationRow(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests & Follow Up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="lab-tests"
                  label="Diagnostic Investigations (comma separated)"
                  placeholder="CBC, Serum Creatinine, Chest X-Ray"
                  value={labTests}
                  onChange={(e) => setLabTests(e.target.value)}
                />
                <Input
                  id="follow-up-date"
                  type="date"
                  label="Next Review / Follow-up Date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Completes appointment & sends digital prescription to patient portal.
                </span>
                <Button
                  type="submit"
                  disabled={savingRx}
                  className="bg-[#0F766E] hover:bg-[#115E59] font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingRx ? "Saving..." : "Save Rx & Complete Consultation"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Prescription Slip SlideDrawer */}
      {prescriptionSlip && (
        <SlideDrawer
          isOpen={!!prescriptionSlip}
          onClose={() => setPrescriptionSlip(null)}
          title={`Digital Prescription: ${prescriptionSlip.prescriptionId}`}
          subtitle={`Issued on ${new Date(prescriptionSlip.createdAt).toLocaleDateString()}`}
          width="lg"
        >
          <div className="space-y-6 text-xs text-[#16324F]">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">{prescriptionSlip.patientName}</span>
                <span className="text-[#64748B]">
                  Token: {prescriptionSlip.tokenNumber} • Doctor: {prescriptionSlip.doctorName}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">
                Diagnosis
              </span>
              <p className="text-sm font-semibold text-[#0F766E]">{prescriptionSlip.diagnosis}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">
                Prescribed Medicines
              </span>
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {prescriptionSlip.medications?.map((m: any, i: number) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">{m.medicineName}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {m.dosage} • {m.frequency} • {m.instructions}
                      </p>
                    </div>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[11px]">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideDrawer>
      )}
    </div>
  );
}
