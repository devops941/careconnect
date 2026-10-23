import mongoose from "mongoose";
import { Hospital, IHospital } from "@/models/Hospital";
import { HospitalSetting } from "@/models/HospitalSetting";
import { Doctor } from "@/models/Doctor";
import { connectToDatabase } from "../database/mongodb";

export interface CreateHospitalDto {
  name: string;
  code: string;
  tagline?: string;
  contactEmail: string;
  phone?: string;
  emergencyPhone: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  departments?: string[];
  emergency24x7?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  isMainBranch?: boolean;
}

export class HospitalRepository {
  /**
   * Ensures at least one primary hospital exists and seeds if empty.
   * Also ensures legacy doctors have hospitalId linked.
   */
  async ensureDefaultHospital(): Promise<IHospital> {
    await connectToDatabase();
    let mainHosp = await Hospital.findOne({ isMainBranch: true }).exec();

    if (!mainHosp) {
      mainHosp = await Hospital.findOne().sort({ createdAt: 1 }).exec();
    }

    if (!mainHosp) {
      // Pull name/settings from HospitalSetting if exists
      const existingSetting = await HospitalSetting.findOne().exec();
      const hospName = existingSetting?.hospitalName || "CareConnect Main Hospital";
      const hospEmail = existingSetting?.contactEmail || "admin@careconnect.health";
      const hospPhone = existingSetting?.emergencyPhone || "+91 44 2800 1000";

      mainHosp = await Hospital.create({
        hospitalId: "HOSP-001",
        name: hospName,
        code: "CC-MAIN",
        tagline: existingSetting?.tagline || "Clinical Operations & Multi-Specialty Care",
        contactEmail: hospEmail,
        phone: hospPhone,
        emergencyPhone: hospPhone,
        licenseNumber: existingSetting?.licenseNumber || "HOSP-LIC-2026-X1",
        address: existingSetting?.address || {
          street: "100 Healthcare Parkway",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600001",
          country: "India",
        },
        departments: existingSetting?.departments || [
          "General Medicine",
          "Cardiology",
          "Pediatrics",
          "Orthopedics",
          "Radiology",
          "Emergency & Trauma",
        ],
        emergency24x7: true,
        status: "ACTIVE",
        isMainBranch: true,
      });
    }

    // Link any orphan/legacy doctors to this main hospital
    await Doctor.updateMany(
      { hospitalId: { $exists: false } },
      { $set: { hospitalId: mainHosp._id, hospitalName: mainHosp.name } }
    ).exec();

    return mainHosp;
  }

  async getAllHospitals(status?: string): Promise<IHospital[]> {
    await this.ensureDefaultHospital();
    const query: Record<string, any> = {};
    if (status) {
      query.status = status;
    }
    return Hospital.find(query).sort({ isMainBranch: -1, name: 1 }).exec();
  }

  async getHospitalById(id: string): Promise<IHospital | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Hospital.findById(id).exec();
  }

  async createHospital(dto: CreateHospitalDto): Promise<IHospital> {
    await connectToDatabase();
    // Generate sequential Hospital ID
    const count = await Hospital.countDocuments();
    const nextNum = String(count + 1).padStart(3, "0");
    const hospitalId = `HOSP-${nextNum}`;

    const newHosp = new Hospital({
      ...dto,
      hospitalId,
      code: dto.code.toUpperCase().trim(),
      status: dto.status || "ACTIVE",
    });

    return newHosp.save();
  }

  async updateHospital(id: string, dto: Partial<CreateHospitalDto>): Promise<IHospital | null> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Hospital.findByIdAndUpdate(
      id,
      { $set: dto },
      { returnDocument: "after" }
    ).exec();
  }

  async deleteHospital(id: string): Promise<boolean> {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Hospital.findByIdAndDelete(id).exec();
    return !!res;
  }
}

export const hospitalRepository = new HospitalRepository();
