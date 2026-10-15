import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireAuth } from "@/server/middleware/require-auth";
import { handleApiError } from "@/server/errors/error-handler";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";
import { Appointment } from "@/models/Appointment";
import { QueueToken } from "@/models/QueueToken";
import { Invoice } from "@/models/Invoice";
import { Patient } from "@/models/Patient";
import { HospitalSetting } from "@/models/HospitalSetting";

export async function GET(req: NextRequest) {
  try {
    const { identity } = await requireAuth();
    if (identity.role !== "SUPER_ADMIN" && identity.role !== "ADMIN") {
      return handleApiError(new Error("Unauthorized: Super Admin or Admin access required"), 403);
    }

    await connectToDatabase();

    const [hospitalSettings, departments, doctors, patients, appointments, queueTokens, invoices] =
      await Promise.all([
        HospitalSetting.find({}).lean(),
        Department.find({}).lean(),
        Doctor.find({}).lean(),
        Patient.find({}, "-passwordHash").lean(),
        Appointment.find({}).lean(),
        QueueToken.find({}).lean(),
        Invoice.find({}).lean(),
      ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "CareConnect-v2.0",
      exportedBy: identity.email,
      collections: {
        hospitalSettings,
        departments,
        doctors,
        patients,
        appointments,
        queueTokens,
        invoices,
      },
      stats: {
        totalDoctors: doctors.length,
        totalDepartments: departments.length,
        totalAppointments: appointments.length,
        totalInvoices: invoices.length,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const filename = `careconnect-backup-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
