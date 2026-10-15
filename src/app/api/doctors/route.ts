import { NextRequest } from "next/server";
import { z } from "zod";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";
import { Employee } from "@/models/Employee";
import { passwordService } from "@/server/services/password.service";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

const doctorSchema = z.object({
  doctorId: z.string().trim().min(3, "Doctor ID is required").max(20),
  name: z.string().trim().min(2, "Doctor Name is required").max(100),
  email: z.string().trim().email("Valid doctor email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").default("Doctor@123"),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  medicalCouncilRegNo: z.string().optional(),
  specialization: z.string().trim().min(2, "Specialization is required"),
  departmentId: z.string().min(1, "Department is required"),
  qualification: z.string().default("MBBS, MD"),
  experienceYears: z.coerce.number().min(0).default(5),
  consultationFee: z.coerce.number().min(0).default(500),
  opdRoomNo: z.string().default("Room 201"),
  availableDays: z.array(z.string()).default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const query: Record<string, any> = {};
    if (departmentId) {
      query.departmentId = departmentId;
    }

    const doctors = await Doctor.find(query).sort({ name: 1 }).exec();
    return sendSuccess(doctors);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await connectToDatabase();

    const body = await req.json();
    const validated = doctorSchema.parse(body);

    const normalizedEmail = validated.email.toLowerCase().trim();
    const doctorIdUpper = validated.doctorId.toUpperCase().trim();

    // Check if doctor or employee already exists
    const existingDoc = await Doctor.findOne({
      $or: [{ doctorId: doctorIdUpper }, { email: normalizedEmail }],
    });
    if (existingDoc) {
      return handleApiError(
        new Error(`A doctor with ID '${doctorIdUpper}' or email '${normalizedEmail}' already exists.`)
      );
    }

    const dept = await Department.findById(validated.departmentId);

    // 1. Create and save Doctor record
    const doc = new Doctor({
      doctorId: doctorIdUpper,
      name: validated.name,
      email: normalizedEmail,
      phone: validated.phone,
      gender: validated.gender,
      medicalCouncilRegNo: validated.medicalCouncilRegNo,
      specialization: validated.specialization,
      departmentId: validated.departmentId,
      departmentName: dept?.name || "General OPD",
      qualification: validated.qualification,
      experienceYears: validated.experienceYears,
      consultationFee: validated.consultationFee,
      opdRoomNo: validated.opdRoomNo,
      availableDays: validated.availableDays,
      status: validated.status,
    });
    await doc.save();

    // 2. Hash password and provision staff login account in employees collection
    const hashedPassword = await passwordService.hashPassword(validated.password);
    await Employee.findOneAndUpdate(
      { $or: [{ employeeId: doctorIdUpper }, { normalizedEmail }] },
      {
        $set: {
          employeeId: doctorIdUpper,
          name: validated.name,
          email: normalizedEmail,
          normalizedEmail,
          passwordHash: hashedPassword,
          role: "DOCTOR",
          department: dept?.name || "General Medicine",
          phone: validated.phone,
          status: "ACTIVE",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return sendSuccess(doc, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
