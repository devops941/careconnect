import { NextRequest } from "next/server";
import { z } from "zod";
import { Patient } from "@/models/Patient";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";
import { NotFoundError } from "@/server/errors/app-error";
import { passwordService } from "@/server/services/password.service";
import { normalizeEmail } from "@/lib/utils";
import { ACCOUNT_STATUS, AUTH_PROVIDERS } from "@/lib/constants";

const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"]).default("UNKNOWN"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").default("Patient@123"),
});

const updatePatientSchema = z.object({
  id: z.string().min(1, "Patient ID is required"),
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"]).default("UNKNOWN"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await Patient.find(query)
      .select("name email phone bloodGroup dateOfBirth gender status createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(patients);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createPatientSchema.parse(body);

    const normalizedEmail = normalizeEmail(validated.email);
    const existing = await Patient.findOne({ normalizedEmail });
    if (existing) {
      return handleApiError(new Error("A patient with this email already exists."));
    }

    const passwordHash = await passwordService.hashPassword(validated.password);

    const patient = new Patient({
      name: validated.name,
      email: validated.email,
      normalizedEmail,
      phone: validated.phone || undefined,
      bloodGroup: validated.bloodGroup,
      gender: validated.gender || undefined,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
      passwordHash,
      authProviders: [AUTH_PROVIDERS.CREDENTIALS],
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
    });

    await patient.save();

    return sendSuccess(
      {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        status: patient.status,
        createdAt: patient.createdAt,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = updatePatientSchema.parse(body);

    const patient = await Patient.findById(validated.id);
    if (!patient) {
      return handleApiError(new NotFoundError("Patient record not found."));
    }

    const newNormalizedEmail = normalizeEmail(validated.email);
    if (newNormalizedEmail !== patient.normalizedEmail) {
      const emailConflict = await Patient.findOne({
        normalizedEmail: newNormalizedEmail,
        _id: { $ne: patient._id },
      });
      if (emailConflict) {
        return handleApiError(new Error("Another patient already uses this email address."));
      }
    }

    const oldNormalizedEmail = patient.normalizedEmail;

    patient.name = validated.name;
    patient.email = validated.email;
    patient.normalizedEmail = newNormalizedEmail;
    patient.phone = validated.phone || undefined;
    patient.bloodGroup = validated.bloodGroup;
    patient.gender = validated.gender || undefined;
    patient.dateOfBirth = validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined;
    patient.status = validated.status;

    let newPasswordHash: string | undefined;
    if (validated.password && validated.password.trim().length >= 6) {
      newPasswordHash = await passwordService.hashPassword(validated.password);
      patient.passwordHash = newPasswordHash;
    }

    await patient.save();

    // Also sync User collection if user account exists
    try {
      const { User } = await import("@/models/User");
      const userDoc = await User.findOne({
        $or: [{ normalizedEmail: oldNormalizedEmail }, { normalizedEmail: newNormalizedEmail }],
      });
      if (userDoc) {
        userDoc.name = validated.name;
        userDoc.email = validated.email;
        userDoc.normalizedEmail = newNormalizedEmail;
        userDoc.status = validated.status;
        if (newPasswordHash) {
          userDoc.passwordHash = newPasswordHash;
        }
        await userDoc.save();
      }
    } catch {
      // Ignore user collection sync if not present
    }

    return sendSuccess({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      bloodGroup: patient.bloodGroup,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      status: patient.status,
      createdAt: patient.createdAt,
      message: "Patient record updated successfully.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return handleApiError(new Error("Patient ID is required."));
    }

    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return handleApiError(new NotFoundError("Patient record not found."));
    }

    return sendSuccess({ message: "Patient record deleted successfully." });
  } catch (err) {
    return handleApiError(err);
  }
}
