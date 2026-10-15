"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InvoiceReceiptModal, InvoiceData } from "@/components/billing/InvoiceReceiptModal";

interface PatientBillsViewProps {
  hospitalName?: string;
  emergencyPhone?: string;
}

export function PatientBillsView({
  hospitalName = "CareConnect Health Systems",
  emergencyPhone = "+91 98765 43210",
}: PatientBillsViewProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceData | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceData | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [submittingPay, setSubmittingPay] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Failed to load patient bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const pendingInvoices = invoices.filter((i) => i.paymentStatus !== "PAID");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Handle Online UPI Settlement
  const handlePayConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    try {
      setSubmittingPay(true);
      const res = await fetch(`/api/invoices/${payingInvoice._id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "UPI",
          amount: payingInvoice.balanceDue,
          transactionId: utrInput.trim() || `UPI-${Date.now()}`,
          notes: "Settled via Patient Portal Dynamic UPI QR",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvoices(invoices.map((i) => (i._id === data.data._id ? data.data : i)));
        setPayingInvoice(null);
        setUtrInput("");
        setSelectedReceipt(data.data); // Open official receipt!
      }
    } catch (err) {
      console.error("Online payment error:", err);
    } finally {
      setSubmittingPay(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#0F766E]" />
            <span>My Bills, Invoices & Tax Receipts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View consultation fee breakdowns, pay pending hospital charges, and download official receipts for claims.
          </p>
        </div>
      </div>

      {/* 2. Pending Dues Alert Banner */}
      {pendingInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">
                Outstanding Balance Due:{" "}
                <span className="font-mono text-amber-700 font-black">
                  ₹{totalPending.toLocaleString("en-IN")}
                </span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                You have {pendingInvoices.length} unpaid bill(s). You can pay via Instant UPI QR or at the hospital billing desk.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setPayingInvoice(pendingInvoices[0])}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Pay via UPI QR (₹{pendingInvoices[0].balanceDue})</span>
          </Button>
        </div>
      )}

      {/* 3. Bills List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xs">
            Billing & Invoicing History ({invoices.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Official E-Receipts valid for Medical Insurance
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading your medical bills...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No hospital bills found</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Invoices will automatically appear here when you book consultations or get registered for OPD.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const isPaid = inv.paymentStatus === "PAID";
              return (
                <div
                  key={inv._id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Left: Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        #{inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                      {inv.queueTokenNumber && (
                        <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Token #{inv.queueTokenNumber}
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-slate-800 text-sm">
                      {inv.doctorName ? `Consultation with ${inv.doctorName}` : "Hospital Services"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>{new Date(inv.issuedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}</span>
                      <span>•</span>
                      <span>{inv.departmentName || "Clinical Suite"}</span>
                      {inv.paymentMethod !== "UNPAID" && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            Mode: {inv.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        Total Amount
                      </span>
                      <p className="font-mono font-black text-slate-900 text-base">
                        ₹{inv.totalAmount.toLocaleString("en-IN")}
                      </p>
                      {inv.balanceDue > 0 && (
                        <span className="text-[11px] text-rose-600 font-bold block">
                          Due: ₹{inv.balanceDue.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <Button
                          size="sm"
                          onClick={() => setPayingInvoice(inv)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pay UPI</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(inv)}
                        className="gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Dynamic Instant UPI QR Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Instant UPI Payment
              </span>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Scan using PhonePe, GPay, or Paytm</p>
              <p className="font-mono font-black text-2xl text-slate-900">
                ₹{payingInvoice.balanceDue.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] font-mono text-[#0F766E] font-semibold">
                CareConnect Hospital VPA: careconnect@icici
              </p>
            </div>

            {/* Stylized QR Code Graphic Container */}
            <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-[#0F766E]/40 flex flex-col items-center justify-center relative shadow-inner">
              <QrCode className="w-36 h-36 text-slate-900" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-[#0F766E] border border-slate-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <form onSubmit={handlePayConfirm} className="space-y-3 text-left text-xs pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enter UTR / Transaction Reference (Optional)
                </label>
                <Input
                  placeholder="e.g. 40182749102"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={submittingPay}
                className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-bold py-2.5 shadow-md"
              >
                {submittingPay ? "Verifying..." : "I Have Paid • Generate Receipt"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Official Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedReceipt}
        hospitalName={hospitalName}
        emergencyPhone={emergencyPhone}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
