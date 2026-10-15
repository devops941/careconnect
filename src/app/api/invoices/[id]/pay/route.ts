import { NextRequest } from "next/server";
import { z } from "zod";
import { Invoice } from "@/models/Invoice";
import { Notification } from "@/models/Notification";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";
import { NotFoundError } from "@/server/errors/app-error";

const settlePaymentSchema = z.object({
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "NET_BANKING"]),
  amount: z.number().min(1, "Payment amount must be greater than zero"),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const { id } = await params;
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return handleApiError(new NotFoundError("Invoice not found"));
    }

    const body = await req.json();
    const validated = settlePaymentSchema.parse(body);

    const newPaidAmount = (invoice.paidAmount || 0) + validated.amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);

    let newStatus: "PAID" | "PARTIALLY_PAID" = "PARTIALLY_PAID";
    if (newBalanceDue === 0) {
      newStatus = "PAID";
    }

    invoice.paidAmount = newPaidAmount;
    invoice.balanceDue = newBalanceDue;
    invoice.paymentStatus = newStatus;
    invoice.paymentMethod = validated.paymentMethod;
    if (validated.transactionId) invoice.transactionId = validated.transactionId;
    if (validated.notes) invoice.notes = validated.notes;
    invoice.cashierName = identity.name || "Cashier Desk";
    invoice.paidAt = new Date();

    await invoice.save();

    // Create Notification
    await Notification.create({
      recipientEmail: invoice.patientEmail || "patient@careconnect.local",
      recipientType: "PATIENT",
      type: "BILLING",
      title: "Payment Received",
      message: `Payment of ₹${validated.amount} recorded for Invoice #${invoice.invoiceNumber}. Balance due: ₹${newBalanceDue}.`,
    });

    return sendSuccess(invoice);
  } catch (err) {
    return handleApiError(err);
  }
}
