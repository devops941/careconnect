import { NextRequest } from "next/server";
import { z } from "zod";
import { hospitalRepository } from "@/server/repositories/hospital.repository";
import { Doctor } from "@/models/Doctor";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const createHospitalSchema = z.object({
  name: z.string().trim().min(2, "Hospital name must be at least 2 characters").max(150),
  code: z.string().trim().min(2, "Branch code must be at least 2 characters").max(15),
  tagline: z.string().optional(),
  contactEmail: z.string().trim().email("Valid email required"),
  phone: z.string().optional(),
  emergencyPhone: z.string().min(5, "Emergency hotline is required"),
  licenseNumber: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().optional(),
      country: z.string().default("India"),
    })
    .optional(),
  departments: z.array(z.string()).default([
    "General Medicine",
    "Cardiology",
    "Pediatrics",
    "Orthopedics",
  ]),
  emergency24x7: z.boolean().default(true),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  isMainBranch: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const hospitals = await hospitalRepository.getAllHospitals(status);

    // Attach doctor counts for each hospital
    await connectToDatabase();
    const docCounts = await Doctor.aggregate([
      { $group: { _id: "$hospitalId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(docCounts.map((d) => [String(d._id), d.count]));

    const enrichedHospitals = hospitals.map((h) => ({
      ...h.toObject(),
      doctorCount: countMap.get(String(h._id)) || 0,
    }));

    return sendSuccess(enrichedHospitals);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();
    const validated = createHospitalSchema.parse(body);

    const hospital = await hospitalRepository.createHospital(validated);
    return sendSuccess(hospital, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
