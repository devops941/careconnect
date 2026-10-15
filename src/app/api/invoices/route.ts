import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Invoice } from "@/models/Invoice";
import { Notification } from "@/models/Notification";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description required"),
  category: z.enum(["CONSULTATION", "REGISTRATION", "LAB", "PHARMACY", "PROCEDURE", "OTHER"]).default("CONSULTATION"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(1).default(1),
  total: z.number().min(0),
});

const createInvoiceSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  patientPhone: z.string().optional(),
  patientEmail: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  departmentName: z.string().optional(),
  appointmentId: z.string().optional(),
  queueTokenNumber: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one billing item is required"),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "NET_BANKING", "UNPAID"]).default("UNPAID"),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    // Patient sees only their own bills
    if (identity.role === "PATIENT") {
      query.patientId = identity.id;
    } else {
      // Staff/Doctor/Admin queries
      if (searchParams.get("patientId")) {
        query.patientId = searchParams.get("patientId");
      }
    }

    if (status && status !== "ALL") {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { patientName: { $regex: search, $options: "i" } },
        { queueTokenNumber: { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ issuedAt: -1 })
      .limit(100)
      .exec();

    return sendSuccess(invoices);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createInvoiceSchema.parse(body);

    // Calculate totals safely
    const subtotal = validated.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = Math.max(0, subtotal - validated.discount + validated.tax);
    const paidAmount = validated.paidAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" = "PENDING";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = "PARTIALLY_PAID";
    }

    // Generate unique human-readable invoice sequence
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments();
    const randomSuffix = crypto.randomInt(1000, 9999);
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, "0")}-${randomSuffix}`;

    const newInvoice = await Invoice.create({
      ...validated,
      invoiceNumber,
      subtotal,
      totalAmount,
      balanceDue,
      paymentStatus,
      cashierName: identity.name || "CareConnect Desk",
      issuedAt: new Date(),
      paidAt: paymentStatus === "PAID" ? new Date() : undefined,
    });

    // Notify Patient of bill generation
    await Notification.create({
      recipientEmail: validated.patientEmail || "patient@careconnect.local",
      recipientType: "PATIENT",
      type: "BILLING",
      title: paymentStatus === "PAID" ? "Payment Receipt Generated" : "New Hospital Bill Issued",
      message:
        paymentStatus === "PAID"
          ? `Receipt #${invoiceNumber} for ₹${totalAmount} has been generated. Thank you for your payment.`
          : `Bill #${invoiceNumber} for ₹${totalAmount} has been issued. Balance due: ₹${balanceDue}.`,
    });

    return sendSuccess(newInvoice, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
