import { redirect } from "next/navigation";
import { requireAuth } from "@/server/middleware/require-auth";
import { hospitalSettingRepository } from "@/server/repositories/hospital-setting.repository";
import { connectToDatabase } from "@/server/database/mongodb";
import { QueueToken } from "@/models/QueueToken";
import { Appointment } from "@/models/Appointment";
import { PatientDashboardClient } from "./PatientDashboardClient";

export const metadata = {
  title: "Patient Portal | CareConnect",
  description: "Personal healthcare portal for live queue status, appointments, and prescriptions.",
};

export default async function PatientDashboardPage() {
  let authContext;
  try {
    authContext = await requireAuth();
  } catch {
    redirect("/login");
  }

  const { identity } = authContext;

  // Strict isolation: hospital staff cannot access patient portal
  if (identity.role !== "PATIENT") {
    redirect("/staff/dashboard");
  }

  await connectToDatabase();
  const hospitalSettings = await hospitalSettingRepository.getSettings();
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch active queue token for this patient today
  const activeTokenDoc = await QueueToken.findOne({
    $or: [
      { patientId: identity.id },
      { patientName: { $regex: new RegExp(`^${identity.name.trim()}$`, "i") } },
    ],
    tokenDate: today,
    status: { $in: ["WAITING", "CALLED", "IN_CONSULTATION"] },
  }).lean();

  // 2. Fetch latest active appointment pass (confirmed/checked_in/pending)
  const activeAppointmentDoc = await Appointment.findOne({
    $or: [
      { patientId: identity.id },
      { patientEmail: identity.email },
      { patientName: { $regex: new RegExp(`^${identity.name.trim()}$`, "i") } },
    ],
    status: { $in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
  })
    .sort({ appointmentDate: 1, timeSlot: 1 })
    .lean();

  const activeToken = activeTokenDoc
    ? {
        tokenNumber: activeTokenDoc.tokenNumber,
        tokenSequence: activeTokenDoc.tokenSequence,
        status: activeTokenDoc.status,
        doctorName: activeTokenDoc.doctorName,
        departmentName: activeTokenDoc.departmentName,
        opdRoomNo: activeTokenDoc.opdRoomNo,
      }
    : null;

  const activeAppointment = activeAppointmentDoc
    ? {
        _id: String(activeAppointmentDoc._id),
        appointmentId: activeAppointmentDoc.appointmentId,
        doctorName: activeAppointmentDoc.doctorName,
        departmentName: activeAppointmentDoc.departmentName,
        appointmentDate: activeAppointmentDoc.appointmentDate,
        timeSlot: activeAppointmentDoc.timeSlot,
        status: activeAppointmentDoc.status,
        tokenNumber: activeAppointmentDoc.tokenNumber,
        notes: activeAppointmentDoc.notes,
      }
    : null;

  return (
    <PatientDashboardClient
      user={{
        id: identity.id,
        name: identity.name,
        email: identity.email,
        role: identity.role,
        identityType: identity.identityType,
        status: identity.status,
      }}
      hospitalSettings={{
        hospitalName: hospitalSettings.hospitalName,
        tagline: hospitalSettings.tagline,
        emergencyPhone: hospitalSettings.emergencyPhone,
        emergency24x7: hospitalSettings.emergency24x7,
      }}
      activeToken={activeToken}
      activeAppointment={activeAppointment}
    />
  );
}
