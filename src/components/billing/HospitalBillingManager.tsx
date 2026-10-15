"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Receipt,
  Banknote,
  QrCode,
  DollarSign,
  TrendingUp,
  User,
  Stethoscope,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InvoiceReceiptModal, InvoiceData } from "./InvoiceReceiptModal";

interface DoctorOption {
  _id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  departmentName?: string;
}

export function HospitalBillingManager() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  // Modals state
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceData | null>(null);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [settlingInvoice, setSettlingInvoice] = useState<InvoiceData | null>(null);

  // New Bill Form State
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [includeRegFee, setIncludeRegFee] = useState(true);
  const [customFee, setCustomFee] = useState<number>(500);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD" | "UNPAID">("CASH");
  const [utrNumber, setUtrNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Settlement Form State
  const [settleMethod, setSettleMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [settleUtr, setSettleUtr] = useState("");
  const [settlingAmount, setSettlingAmount] = useState<number>(0);
  const [isSettling, setIsSettling] = useState(false);

  // Load Invoices & Doctors
  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, docRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/doctors"),
      ]);
      const invData = await invRes.json();
      const docData = await docRes.json();

      if (invData.success) {
        setInvoices(invData.data);
      }
      if (docData.success) {
        setDoctors(docData.data);
        if (docData.data.length > 0) {
          setSelectedDoctorId(docData.data[0]._id);
          setCustomFee(docData.data[0].consultationFee || 500);
        }
      }
    } catch (err) {
      console.error("Failed to load billing records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When selected doctor changes, update fee
  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find((d) => d._id === docId);
    if (doc) {
      setCustomFee(doc.consultationFee || 500);
    }
  };

  // KPIs
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPendingDues = invoices.reduce((acc, curr) => acc + curr.balanceDue, 0);
  const cashCollected = invoices
    .filter((inv) => inv.paymentMethod === "CASH")
    .reduce((acc, curr) => acc + curr.paidAmount, 0);
  const upiCollected = invoices
    .filter((inv) => inv.paymentMethod === "UPI" || inv.paymentMethod === "CARD")
    .reduce((acc, curr) => acc + curr.paidAmount, 0);

  // Filtered List
  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "PENDING" && inv.paymentStatus !== "PAID") ||
      (activeTab === "PAID" && inv.paymentStatus === "PAID");

    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.queueTokenNumber && inv.queueTokenNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Handle Bill Submission
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    try {
      setSubmitting(true);
      const doc = doctors.find((d) => d._id === selectedDoctorId);

      const items = [
        {
          description: `OPD Consultation - ${doc?.name || "Consultant"} (${doc?.specialization || "General"})`,
          category: "CONSULTATION" as const,
          unitPrice: customFee,
          quantity: 1,
          total: customFee,
        },
      ];

      if (includeRegFee) {
        items.push({
          description: "Hospital OPD Registration & Card Charges",
          category: "REGISTRATION" as const,
          unitPrice: 100,
          quantity: 1,
          total: 100,
        });
      }

      const total = items.reduce((s, i) => s + i.total, 0);
      const isPaid = paymentMode !== "UNPAID";

      const payload = {
        patientId: "641004f1c08cf000d15fd715", // Default or walk-in patient ID
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim() || undefined,
        doctorId: doc?._id,
        doctorName: doc?.name,
        departmentName: doc?.departmentName || doc?.specialization,
        items,
        paidAmount: isPaid ? total : 0,
        paymentMethod: paymentMode,
        transactionId: utrNumber.trim() || undefined,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setInvoices([data.data, ...invoices]);
        setIsCreatingBill(false);
        setPatientName("");
        setPatientPhone("");
        setUtrNumber("");
        setSelectedReceipt(data.data); // Automatically preview receipt!
      }
    } catch (err) {
      console.error("Failed to generate bill:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Payment Settlement
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingInvoice) return;

    try {
      setIsSettling(true);
      const res = await fetch(`/api/invoices/${settlingInvoice._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: settleMethod,
          amount: settlingAmount,
          transactionId: settleUtr.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvoices(invoices.map((inv) => (inv._id === data.data._id ? data.data : inv)));
        setSettlingInvoice(null);
        setSelectedReceipt(data.data); // Open updated receipt
      }
    } catch (err) {
      console.error("Settlement error:", err);
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#0F766E]" />
            <span>Hospital Billing & Cashier Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect OPD consultation fees, track pending dues, and issue official payment tax receipts.
          </p>
        </div>

        <Button
          onClick={() => setIsCreatingBill(true)}
          className="gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill / Receipt</span>
        </Button>
      </div>

      {/* 2. Financial KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ₹{totalBilled.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {invoices.length} Total Bills Generated
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Cash Counter
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            ₹{cashCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Physically In Cash Drawer
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              UPI & Card POS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2 font-mono">
            ₹{upiCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            Bank Direct Settlement
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">
            ₹{totalPendingDues.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            To Be Collected At Counter
          </span>
        </div>
      </div>

      {/* 3. Filter Bar & Invoices Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "PENDING"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Pending Dues ({invoices.filter((i) => i.paymentStatus !== "PAID").length})
            </button>
            <button
              onClick={() => setActiveTab("PAID")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "PAID"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Paid Receipts ({invoices.filter((i) => i.paymentStatus === "PAID").length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, invoice #, token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient & Token</th>
                <th className="py-3 px-4">Doctor / Service</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading hospital ledger...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No billing records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.paymentStatus === "PAID";
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {new Date(inv.issuedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{inv.patientName}</span>
                        {inv.queueTokenNumber && (
                          <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            Token #{inv.queueTokenNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {inv.doctorName || "General Consultation"}
                        </span>
                        <span className="text-[11px] text-slate-400">{inv.departmentName}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        ₹{inv.totalAmount.toLocaleString("en-IN")}
                        {inv.balanceDue > 0 && (
                          <span className="block text-[10px] text-rose-600 font-bold">
                            Due: ₹{inv.balanceDue.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{inv.paymentStatus}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {inv.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSettlingInvoice(inv);
                                setSettlingAmount(inv.balanceDue);
                              }}
                              className="text-[11px] font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 px-2.5 py-1"
                            >
                              Collect Fee
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReceipt(inv)}
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 gap-1 px-2.5 py-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. New Bill Generator Modal */}
      {isCreatingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0F766E]" />
                <span>Fast OPD Token / Consultation Bill</span>
              </h3>
              <button
                onClick={() => setIsCreatingBill(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number (Optional)</label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Clinician / Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialization} (Fee: ₹{d.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Registration Fee (₹100)</span>
                  <span className="text-[11px] text-slate-500">First time OPD card charges</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeRegFee}
                  onChange={(e) => setIncludeRegFee(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                <span className="font-black text-slate-800 text-sm">Total Payable Amount:</span>
                <span className="font-mono font-black text-base text-[#0F766E]">
                  ₹{(customFee + (includeRegFee ? 100 : 0)).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Collection Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CASH", "UPI", "CARD", "UNPAID"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 rounded-xl font-bold text-center border transition-all ${
                        paymentMode === mode
                          ? "bg-[#0F766E] text-white border-[#0F766E] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMode === "UPI" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    UPI Reference / UTR Number
                  </label>
                  <Input
                    placeholder="e.g. 331456789012"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingBill(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-white font-bold"
                >
                  {submitting ? "Processing..." : "Generate Bill & Receipt"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Collect Payment Modal */}
      {settlingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                Settle Balance: #{settlingInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSettlingInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Patient</span>
                <p className="font-bold text-sm">{settlingInvoice.patientName}</p>
                <p className="text-xs">Outstanding Due: ₹{settlingInvoice.balanceDue}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount Collecting (₹)</label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={settlingInvoice.balanceDue}
                  value={settlingAmount}
                  onChange={(e) => setSettlingAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSettleMethod(m)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        settleMethod === m
                          ? "bg-[#0F766E] text-white border-[#0F766E]"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {settleMethod === "UPI" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">UPI UTR Ref</label>
                  <Input
                    placeholder="e.g. 40182749102"
                    value={settleUtr}
                    onChange={(e) => setSettleUtr(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettlingInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSettling}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isSettling ? "Recording..." : "Record Payment & Issue Receipt"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Receipt Preview Modal */}
      <InvoiceReceiptModal
        invoice={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
