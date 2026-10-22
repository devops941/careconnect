import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoiceItem {
  description: string;
  category: "CONSULTATION" | "REGISTRATION" | "LAB" | "PHARMACY" | "PROCEDURE" | "OTHER";
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string; // e.g., INV-2026-0001
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId?: mongoose.Types.ObjectId;
  doctorName?: string;
  departmentName?: string;
  appointmentId?: mongoose.Types.ObjectId;
  queueTokenNumber?: string;
  items: IInvoiceItem[];
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
  notes?: string;
  issuedAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["CONSULTATION", "REGISTRATION", "LAB", "PHARMACY", "PROCEDURE", "OTHER"],
      default: "CONSULTATION",
    },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      index: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    departmentName: {
      type: String,
      trim: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      index: true,
    },
    queueTokenNumber: {
      type: String,
      trim: true,
    },
    items: {
      type: [InvoiceItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    balanceDue: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_PAID", "PAID", "REFUNDED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "NET_BANKING", "UNPAID"],
      default: "UNPAID",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    cashierName: {
      type: String,
      default: "Front Desk Cashier",
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
