import { NextRequest } from "next/server";
import { Appointment } from "@/models/Appointment";
import { QueueToken } from "@/models/QueueToken";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";
import { Patient } from "@/models/Patient";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";
import { handleApiError, sendSuccess } from "@/server/errors/error-handler";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"]);
    await connectToDatabase();

    const today = new Date().toISOString().split("T")[0];

    const [
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      todayTokens,
      waitingTokens,
      completedTokens,
      totalDoctors,
      totalDepartments,
      totalPatients,
      departmentStats,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: today }),
      Appointment.countDocuments({ status: "COMPLETED" }),
      Appointment.countDocuments({ status: "CANCELLED" }),
      QueueToken.countDocuments({ tokenDate: today }),
      QueueToken.countDocuments({ tokenDate: today, status: "WAITING" }),
      QueueToken.countDocuments({ tokenDate: today, status: "COMPLETED" }),
      Doctor.countDocuments({ status: "ACTIVE" }),
      Department.countDocuments({ isActive: true }),
      Patient.countDocuments(),
      Department.aggregate([
        {
          $lookup: {
            from: "appointments",
            localField: "_id",
            foreignField: "departmentId",
            as: "apts",
          },
        },
        {
          $project: {
            name: 1,
            code: 1,
            appointmentCount: { $size: "$apts" },
          },
        },
      ]),
    ]);

    return sendSuccess({
      today,
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
      queue: {
        todayTotal: todayTokens,
        waiting: waitingTokens,
        completed: completedTokens,
      },
      counts: {
        doctors: totalDoctors,
        departments: totalDepartments,
        patients: totalPatients,
      },
      departmentStats,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
