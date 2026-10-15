import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicationItem {
  medicineName: string;
  dosage: string; // e.g. 500mg
  frequency: string; // e.g. 1-0-1, 1-1-1
  duration: string; // e.g. 5 days
  instructions: string; // e.g. After meals
}

export interface IPrescription extends Document {
  prescriptionId: string;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  departmentName: string;
  appointmentId?: mongoose.Types.ObjectId;
  tokenNumber?: string;
  diagnosis: string;
  clinicalNotes?: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  medications: IMedicationItem[];
  labInvestigations?: string[];
  followUpDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationItemSchema = new Schema<IMedicationItem>(
  {
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, default: "After food" },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    tokenNumber: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    clinicalNotes: {
      type: String,
      trim: true,
    },
    vitals: {
      bp: { type: String, trim: true },
      pulse: { type: String, trim: true },
      temp: { type: String, trim: true },
      weight: { type: String, trim: true },
    },
    medications: [MedicationItemSchema],
    labInvestigations: [{ type: String, trim: true }],
    followUpDate: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: "prescriptions",
  }
);

export const Prescription: Model<IPrescription> =
  mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
