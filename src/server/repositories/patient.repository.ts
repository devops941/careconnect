import { Patient, IPatient } from "@/models/Patient";
import { connectToDatabase } from "../database/mongodb";
import { AccountStatus } from "@/lib/constants";

export interface CreatePatientDto {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  phone?: string;
  bloodGroup?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  googleProviderId?: string;
  status?: AccountStatus;
  emailVerifiedAt?: Date;
}

export class PatientRepository {
  async findByNormalizedEmail(normalizedEmail: string, includePassword = false): Promise<IPatient | null> {
    await connectToDatabase();
    const query = Patient.findOne({ normalizedEmail });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<IPatient | null> {
    await connectToDatabase();
    const query = Patient.findById(id);
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findByGoogleId(googleProviderId: string): Promise<IPatient | null> {
    await connectToDatabase();
    return Patient.findOne({ googleProviderId }).exec();
  }

  async create(data: CreatePatientDto): Promise<IPatient> {
    await connectToDatabase();
    const patient = new Patient(data);
    return patient.save();
  }

  async updatePassword(id: string, passwordHash: string): Promise<IPatient | null> {
    await connectToDatabase();
    return Patient.findByIdAndUpdate(id, { passwordHash }, { returnDocument: "after" }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectToDatabase();
    await Patient.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async linkGoogleAccount(id: string, googleProviderId: string): Promise<IPatient | null> {
    await connectToDatabase();
    return Patient.findByIdAndUpdate(
      id,
      {
        googleProviderId,
        $addToSet: { authProviders: "google" },
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
      { returnDocument: "after" }
    ).exec();
  }

  async count(): Promise<number> {
    await connectToDatabase();
    return Patient.countDocuments();
  }
}

export const patientRepository = new PatientRepository();
