"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  FileText,
  Printer,
  Calendar,
  Stethoscope,
  Pill,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { SlideDrawer } from "../ui/SlideDrawer";

interface PrescriptionItem {
  _id: string;
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  departmentName: string;
  tokenNumber?: string;
  diagnosis: string;
  clinicalNotes?: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  medications: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  labInvestigations?: string[];
  followUpDate?: string;
  createdAt: string;
}

export function PrescriptionVault() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prescriptions");
      const json = await res.json();
      if (json.success) {
        setPrescriptions(json.data || []);
      }
    } catch {
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#16324F] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0F766E]" />
            <span>Digital Prescriptions & Medical Vault</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            Permanent electronic health records, clinician notes, and medication schedules
          </p>
        </div>

        <span className="text-xs font-bold text-[#0F766E] bg-[#CCFBF1] px-3 py-1 rounded-full">
          {prescriptions.length} Records Found
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
          Loading medical prescriptions...
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#16324F]">No Prescription Records Yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Once your doctor completes your consultation, your official digital prescription will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:border-[#0F766E] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-md">
                    {rx.prescriptionId}
                  </span>
                  <h4 className="text-base font-bold text-[#16324F] mt-1.5">{rx.diagnosis}</h4>
                  <p className="text-xs text-[#64748B]">
                    Dr. {rx.doctorName} • {rx.departmentName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-[#64748B] block">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                  {rx.tokenNumber && (
                    <span className="text-[11px] font-bold text-[#16324F]">Token: {rx.tokenNumber}</span>
                  )}
                </div>
              </div>

              {rx.medications && rx.medications.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Medicines Prescribed ({rx.medications.length}):
                  </span>
                  <p className="text-xs font-medium text-[#16324F] truncate">
                    {rx.medications.map((m) => m.medicineName).join(", ")}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  {rx.followUpDate ? `Review Date: ${rx.followUpDate}` : "Standard Discharged"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRx(rx)}
                  className="text-xs font-bold gap-1 text-[#0F766E] border-[#0F766E]/40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Detail SlideDrawer */}
      {selectedRx && (
        <SlideDrawer
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Digital Prescription: ${selectedRx.prescriptionId}`}
          subtitle={`Issued on ${new Date(selectedRx.createdAt).toLocaleDateString()}`}
          width="lg"
        >
          <div className="space-y-6 text-xs text-[#16324F]">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">{selectedRx.patientName}</span>
                <span className="text-[#64748B]">
                  Dr. {selectedRx.doctorName} • {selectedRx.departmentName}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="gap-1.5 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </Button>
            </div>

            {selectedRx.vitals && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">BP</span>
                  <span className="font-bold">{selectedRx.vitals.bp || "Normal"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Pulse</span>
                  <span className="font-bold">{selectedRx.vitals.pulse || "Normal"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Temp</span>
                  <span className="font-bold">{selectedRx.vitals.temp || "Normal"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Weight</span>
                  <span className="font-bold">{selectedRx.vitals.weight || "-"}</span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">
                Clinical Diagnosis
              </span>
              <p className="text-sm font-bold text-[#0F766E]">{selectedRx.diagnosis}</p>
              {selectedRx.clinicalNotes && (
                <p className="text-xs text-[#64748B] pt-1">{selectedRx.clinicalNotes}</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">
                Prescribed Medications
              </span>
              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden">
                {selectedRx.medications?.map((m, i) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">{m.medicineName}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Dosage: {m.dosage} • Frequency: {m.frequency} • {m.instructions}
                      </p>
                    </div>
                    <span className="font-bold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[11px]">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedRx.labInvestigations && selectedRx.labInvestigations.length > 0 && (
              <div className="p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">
                  Recommended Diagnostic Tests
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedRx.labInvestigations.map((test, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold"
                    >
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SlideDrawer>
      )}
    </div>
  );
}
