import { SuperAdmin, ISuperAdmin } from "@/models/SuperAdmin";
import { connectToDatabase } from "../database/mongodb";
import { AccountStatus } from "@/lib/constants";

export interface CreateSuperAdminDto {
  name: string;
  email: string;
  normalizedEmail: string;
  passwordHash?: string;
  googleProviderId?: string;
  status?: AccountStatus;
  emailVerifiedAt?: Date;
}

export class SuperAdminRepository {
  async findByNormalizedEmail(normalizedEmail: string, includePassword = false): Promise<ISuperAdmin | null> {
    await connectToDatabase();
    const query = SuperAdmin.findOne({ normalizedEmail });
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findById(id: string, includePassword = false): Promise<ISuperAdmin | null> {
    await connectToDatabase();
    const query = SuperAdmin.findById(id);
    if (includePassword) {
      query.select("+passwordHash");
    }
    return query.exec();
  }

  async findByGoogleId(googleProviderId: string): Promise<ISuperAdmin | null> {
    await connectToDatabase();
    return SuperAdmin.findOne({ googleProviderId }).exec();
  }

  async count(): Promise<number> {
    await connectToDatabase();
    return SuperAdmin.countDocuments();
  }

  async create(data: CreateSuperAdminDto): Promise<ISuperAdmin> {
    await connectToDatabase();
    const superAdmin = new SuperAdmin(data);
    return superAdmin.save();
  }

  async updatePassword(id: string, passwordHash: string): Promise<ISuperAdmin | null> {
    await connectToDatabase();
    return SuperAdmin.findByIdAndUpdate(id, { passwordHash }, { returnDocument: "after" }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectToDatabase();
    await SuperAdmin.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async linkGoogleAccount(id: string, googleProviderId: string): Promise<ISuperAdmin | null> {
    await connectToDatabase();
    return SuperAdmin.findByIdAndUpdate(
      id,
      {
        googleProviderId,
        $addToSet: { authProviders: "google" },
        emailVerifiedAt: new Date(),
      },
      { returnDocument: "after" }
    ).exec();
  }
}

export const superAdminRepository = new SuperAdminRepository();
