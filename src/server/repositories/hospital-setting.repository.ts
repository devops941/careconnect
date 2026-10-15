import mongoose from "mongoose";
import { HospitalSetting, IHospitalSetting } from "@/models/HospitalSetting";
import { connectToDatabase } from "../database/mongodb";

export interface UpdateHospitalSettingDto {
  hospitalName: string;
  tagline?: string;
  contactEmail: string;
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
  onboardingCompleted?: boolean;
  setupCompletedBy?: mongoose.Types.ObjectId | string;
}

export class HospitalSettingRepository {
  /**
   * Retrieves the current hospital setting singleton document.
   */
  async getSettings(): Promise<IHospitalSetting> {
    await connectToDatabase();
    let setting = await HospitalSetting.findOne().exec();
    if (!setting) {
      setting = await HospitalSetting.create({
        hospitalName: "CareConnect Health Systems",
        onboardingCompleted: false,
      });
    }
    return setting;
  }

  /**
   * Updates or saves the hospital setting singleton document.
   */
  async updateSettings(data: UpdateHospitalSettingDto): Promise<IHospitalSetting> {
    await connectToDatabase();
    const updatePayload: Record<string, any> = { ...data };
    if (data.setupCompletedBy) {
      updatePayload.setupCompletedBy = new mongoose.Types.ObjectId(data.setupCompletedBy.toString());
    }

    let setting = await HospitalSetting.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { returnDocument: "after", upsert: true }
    ).exec();

    return setting!;
  }
}

export const hospitalSettingRepository = new HospitalSettingRepository();
