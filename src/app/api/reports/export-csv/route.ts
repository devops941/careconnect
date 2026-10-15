import { NextRequest, NextResponse } from "next/server";
import { Appointment } from "@/models/Appointment";
import { QueueToken } from "@/models/QueueToken";
import { connectToDatabase } from "@/server/database/mongodb";
import { requireRole } from "@/server/middleware/require-role";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN", "RECEPTIONIST"]);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "appointments";

    if (type === "queue") {
      const tokens = await QueueToken.find().sort({ createdAt: -1 }).limit(1000).lean();

      const headers = [
        "Token Number",
        "Sequence",
        "Date",
        "Patient Name",
        "Phone",
        "Doctor",
        "Department",
        "Room",
        "Priority",
        "Status",
        "Created At",
      ];

      const rows = tokens.map((t) => [
        t.tokenNumber,
        t.tokenSequence,
        t.tokenDate,
        `"${(t.patientName || "").replace(/"/g, '""')}"`,
        t.patientPhone || "",
        `"${(t.doctorName || "").replace(/"/g, '""')}"`,
        `"${(t.departmentName || "").replace(/"/g, '""')}"`,
        t.opdRoomNo || "",
        t.priority,
        t.status,
        new Date(t.createdAt).toISOString(),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="careconnect_queue_report_${Date.now()}.csv"`,
        },
      });
    }

    // Default: Export appointments
    const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(1000).lean();

    const headers = [
      "Appointment ID",
      "Date",
      "Time Slot",
      "Patient Name",
      "Doctor Name",
      "Department",
      "Type",
      "Status",
      "Token Number",
      "Created At",
    ];

    const rows = appointments.map((a) => [
      a.appointmentId,
      a.appointmentDate,
      a.timeSlot,
      `"${(a.patientName || "").replace(/"/g, '""')}"`,
      `"${(a.doctorName || "").replace(/"/g, '""')}"`,
      `"${(a.departmentName || "").replace(/"/g, '""')}"`,
      a.type,
      a.status,
      a.tokenNumber || "",
      new Date(a.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="careconnect_appointments_report_${Date.now()}.csv"`,
      },
    });
  } catch {
    return new NextResponse("Unauthorized or server error exporting report", { status: 500 });
  }
}
