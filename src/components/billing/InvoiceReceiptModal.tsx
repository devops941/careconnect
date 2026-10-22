"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  CreditCard,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorName?: string;
  departmentName?: string;
  queueTokenNumber?: string;
  items: Array<{
    description: string;
    category: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" | "REFUNDED" | "CANCELLED";
  paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "UNPAID";
  transactionId?: string;
  cashierName: string;
  issuedAt: string;
  paidAt?: string;
}

interface InvoiceReceiptModalProps {
  invoice: InvoiceData | null;
  hospitalName?: string;
  emergencyPhone?: string;
  onClose: () => void;
}

export function InvoiceReceiptModal({
  invoice,
  hospitalName = "CareConnect Health Systems",
  emergencyPhone = "+91 98765 43210",
  onClose,
}: InvoiceReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.paymentStatus === "PAID";
  const formattedDate = new Date(invoice.issuedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #careconnect-printable-receipt,
          #careconnect-printable-receipt * {
            visibility: visible !important;
          }
          #careconnect-printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              Hospital Tax Receipt #{invoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="careconnect-printable-receipt" ref={receiptRef} className="p-8 space-y-6 text-slate-800 print:p-6 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                    {hospitalName}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">
                    NABH Accredited Multi-Speciality Medical Center
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 pt-1">
                Emergency 24x7: <span className="font-semibold">{emergencyPhone}</span> • OPD Billing & Cash Counter
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
                Official Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[10px] text-slate-500">{formattedDate}</p>
            </div>
          </div>

          {/* Patient & Doctor Meta */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Patient Details
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.patientName}</p>
              {invoice.patientPhone && (
                <p className="text-slate-600">Phone: {invoice.patientPhone}</p>
              )}
              {invoice.queueTokenNumber && (
                <p className="text-[#0F766E] font-bold">
                  Queue Token: #{invoice.queueTokenNumber}
                </p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Consultant / Department
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.doctorName || "General OPD"}
              </p>
              <p className="text-slate-600">{invoice.departmentName || "General Medicine"}</p>
              <p className="text-slate-500 text-[11px]">Cashier: {invoice.cashierName}</p>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4 text-center">Category</th>
                  <th className="py-2.5 px-4 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      ₹{item.unitPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-900">
                      ₹{item.total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="flex justify-between items-start pt-2">
            {/* Payment Method Badge */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Payment Mode:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {invoice.paymentMethod}
                </span>
              </div>
              {invoice.transactionId && (
                <p className="text-[11px] text-slate-500 font-mono">
                  UTR / Ref: {invoice.transactionId}
                </p>
              )}
              {isPaid ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid in Full</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending Balance: ₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{invoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Concession / Discount:</span>
                  <span className="font-mono">- ₹{invoice.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Net Amount:</span>
                <span className="font-mono text-[#0F766E]">
                  ₹{invoice.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{invoice.paidAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Signature Stamp */}
          <div className="border-t border-slate-200 pt-6 flex items-end justify-between text-[10px] text-slate-400">
            <div>
              <p>• Valid for tax and medical insurance reimbursement claim.</p>
              <p>• Medicines dispensed subject to doctor prescription validity.</p>
              <p>• Computer-generated e-Receipt. No physical signature required.</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-28 h-10 border-b border-dashed border-slate-300 mx-auto" />
              <span className="font-bold uppercase tracking-wider text-slate-500">
                Authorized Cashier
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
