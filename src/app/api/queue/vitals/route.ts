import { NextRequest } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { QueueToken } from "@/models/QueueToken";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const recordVitalsSchema = z.object({
  tokenId: z.string().min(1, "Token ID is required"),
  heightCm: z.coerce.number().min(30).max(250).optional(),
  weightKg: z.coerce.number().min(1).max(300).optional(),
  bpSystolic: z.coerce.number().min(50).max(280).optional(),
  bpDiastolic: z.coerce.number().min(30).max(180).optional(),
  pulseBpm: z.coerce.number().min(30).max(220).optional(),
  tempFahrenheit: z.coerce.number().min(90).max(110).optional(),
  spo2Percent: z.coerce.number().min(50).max(100).optional(),
  respiratoryRate: z.coerce.number().min(5).max(60).optional(),
  rbsMgDl: z.coerce.number().min(20).max(600).optional(),
  allergies: z.string().trim().optional(),
  chiefComplaints: z.string().trim().optional(),
  nurseNotes: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return handleApiError(new Error("Token ID is required"));
    }

    const token = await QueueToken.findById(tokenId).exec();
    if (!token) {
      return handleApiError(new Error("Queue token not found"));
    }

    return sendSuccess({
      vitals: token.vitals || null,
      vitalsStatus: token.vitalsStatus || "PENDING",
      tokenNumber: token.tokenNumber,
      patientName: token.patientName,
      doctorName: token.doctorName,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = recordVitalsSchema.parse(body);

    const token = await QueueToken.findById(validated.tokenId);
    if (!token) {
      return handleApiError(new Error("Queue token not found"));
    }

    // Auto-calculate BMI if height and weight are provided
    let calculatedBmi: number | undefined = undefined;
    let bmiCategory: string | undefined = undefined;

    if (validated.heightCm && validated.weightKg && validated.heightCm > 0) {
      const heightM = validated.heightCm / 100;
      calculatedBmi = Number((validated.weightKg / (heightM * heightM)).toFixed(1));
      if (calculatedBmi < 18.5) bmiCategory = "Underweight";
      else if (calculatedBmi <= 24.9) bmiCategory = "Normal";
      else if (calculatedBmi <= 29.9) bmiCategory = "Overweight";
      else bmiCategory = "Obese";
    }

    // Format Blood Pressure
    let bpFormatted: string | undefined = undefined;
    if (validated.bpSystolic && validated.bpDiastolic) {
      bpFormatted = `${validated.bpSystolic}/${validated.bpDiastolic} mmHg`;
    }

    const vitalsPayload = {
      heightCm: validated.heightCm,
      weightKg: validated.weightKg,
      bmi: calculatedBmi,
      bmiCategory,
      bpSystolic: validated.bpSystolic,
      bpDiastolic: validated.bpDiastolic,
      bpFormatted,
      pulseBpm: validated.pulseBpm,
      tempFahrenheit: validated.tempFahrenheit,
      spo2Percent: validated.spo2Percent,
      respiratoryRate: validated.respiratoryRate,
      rbsMgDl: validated.rbsMgDl,
      allergies: validated.allergies || "None Reported",
      chiefComplaints: validated.chiefComplaints,
      nurseNotes: validated.nurseNotes,
      recordedByNurseId: new mongoose.Types.ObjectId(identity.id),
      recordedByNurseName: identity.name,
      recordedAt: new Date(),
    };

    token.vitals = vitalsPayload as any;
    token.vitalsStatus = "RECORDED";
    await token.save();

    return sendSuccess(token);
  } catch (err) {
    return handleApiError(err);
  }
}
