"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck2, Plus, CheckCircle2, Ticket, XCircle, Search, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusBadge } from "../ui/StatusBadge";
import { FormError } from "../auth/FormError";

interface AppointmentItem {
  _id: string;
  appointmentId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  tokenNumber?: string;
  type: string;
}

interface DoctorOption {
  _id: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  consultationFee?: number;
}

interface DeptOption {
  _id: string;
  name: string;
}

interface PatientOption {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AppointmentManagerProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
}

export function AppointmentManager({ currentUser }: AppointmentManagerProps) {
  const isPatientUser = currentUser?.role === "PATIENT";

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isBookingMode, setIsBookingMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Booking Form State
  const [selectedPatientDropdownId, setSelectedPatientDropdownId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(
    isPatientUser ? currentUser?.id : undefined
  );
  const [patientName, setPatientName] = useState(isPatientUser ? currentUser?.name || "" : "");
  const [patientPhone, setPatientPhone] = useState(isPatientUser ? currentUser?.phone || "" : "");
  const [patientEmail, setPatientEmail] = useState(isPatientUser ? currentUser?.email || "" : "");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 10:00 AM");
  const [type, setType] = useState<"IN_PERSON" | "FOLLOW_UP">("IN_PERSON");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [aptRes, docRes, deptRes, patRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/doctors"),
        fetch("/api/departments"),
        fetch("/api/patients"),
      ]);

      const aptData = await aptRes.json();
      const docData = await docRes.json();
      const deptData = await deptRes.json();
      const patData = await patRes.json();

      if (aptRes.ok && aptData.success) setAppointments(aptData.data || []);
      if (docRes.ok && docData.success) {
        setDoctors(docData.data || []);
        if (docData.data?.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docData.data[0]._id);
        }
      }
      if (deptRes.ok && deptData.success) {
        setDepartments(deptData.data || []);
        if (deptData.data?.length > 0 && !selectedDeptId) {
          setSelectedDeptId(deptData.data[0]._id);
        }
      }
      if (patRes.ok && patData.success) {
        setRegisteredPatients(patData.data || []);
      }
    } catch {
      console.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (isPatientUser && currentUser) {
      setPatientName(currentUser.name || "");
      setPatientEmail(currentUser.email || "");
      setSelectedPatientId(currentUser.id);
    }
  }, [currentUser]);

  const handlePatientDropdownChange = (val: string) => {
    setSelectedPatientDropdownId(val);
    if (val === "MANUAL") {
      setSelectedPatientId(undefined);
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
    } else if (val) {
      const found = registeredPatients.find((p) => p._id === val);
      if (found) {
        setSelectedPatientId(found._id);
        setPatientName(found.name);
        setPatientPhone(found.phone || "");
        setPatientEmail(found.email || "");
      }
    } else {
      setSelectedPatientId(undefined);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !selectedDoctorId || !selectedDeptId) {
      setFormError("Patient Name, Department, and Doctor are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId || (isPatientUser ? currentUser?.id : undefined),
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim() || undefined,
          patientEmail: patientEmail.trim() || undefined,
          departmentId: selectedDeptId,
          doctorId: selectedDoctorId,
          appointmentDate,
          timeSlot,
          type,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to book appointment");
      }

      toast.success(`Appointment confirmed! ID: ${data.data.appointmentId}`);
      setIsBookingMode(false);
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Error booking appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Check-in & Queue Token Issuance
  const handleCheckIn = async (apt: AppointmentItem) => {
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          doctorId: apt.doctorId,
          departmentId: apt.departmentId,
          appointmentId: apt._id,
          priority: "NORMAL",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to generate token");
      }

      toast.success(`Patient Checked In! Token Issued: ${data.data.tokenNumber}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Check-in failed");
    }
  };

  const handleCancel = async (aptId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", cancellationReason: "Cancelled by staff/patient" }),
      });
      if (res.ok) {
        toast.success("Appointment cancelled");
        loadData();
      }
    } catch {
      toast.error("Error cancelling appointment");
    }
  };

  const filteredDoctors = selectedDeptId
    ? doctors.filter((d) => d.departmentId === selectedDeptId)
    : doctors;

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.appointmentId.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // FULL-PAGE VIEW: Book Doctor Appointment (NO OVERLAY!)
  if (isBookingMode) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBookingMode(false)}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16324F] transition-colors"
              title="Return to Appointments List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#16324F]">
                Book Doctor Appointment
              </h2>
              <p className="text-xs text-[#64748B]">
                Schedule an in-person OPD consultation with an available hospital specialist.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBookingMode(false)}
            className="text-xs font-bold"
          >
            Cancel & Return to List
          </Button>
        </div>

        <form onSubmit={handleBook} className="space-y-6 w-full">
          <FormError message={formError} />

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Patient Identification & Contact
            </h3>

            {/* If Staff: Show Quick Patient Dropdown Selector */}
            {!isPatientUser ? (
              <div className="p-4 bg-white rounded-xl border border-teal-200/80 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-bold text-[#16324F]">
                    Select Registered Patient (Auto-fills Info)
                  </label>
                  <span className="text-[11px] text-[#0F766E] font-medium">
                    Or select &quot;✍️ Enter New / Manual Patient&quot; below
                  </span>
                </div>
                <select
                  value={selectedPatientDropdownId}
                  onChange={(e) => handlePatientDropdownChange(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                >
                  <option value="">-- Choose Registered Patient ({registeredPatients.length} on file) --</option>
                  <option value="MANUAL">✍️ Enter New / Manual Patient (Walk-in)</option>
                  {registeredPatients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.phone ? `• ${p.phone}` : ""} {p.email ? `• ${p.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* If Logged-in Patient: Show Verified Badge */
              <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-xs text-[#0F766E] flex items-center justify-between">
                <div>
                  <span className="font-bold block">Booking Consultation for Your Verified Account</span>
                  <span className="text-[11px] text-teal-800">{currentUser?.name} • {currentUser?.email}</span>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Verified Patient
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <Input
                label="Patient Full Name *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Arunachalam"
                required
                disabled={isPatientUser}
              />

              <Input
                label="Contact Phone"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                disabled={isPatientUser}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Clinical Specialization & Appointment Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Clinical Department *</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    const firstDoc = doctors.find((d) => d.departmentId === e.target.value);
                    if (firstDoc) setSelectedDoctorId(firstDoc._id);
                  }}
                  className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Select Specialist Doctor *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                >
                  {filteredDoctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} (Fee: ₹{doc.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Appointment Date *"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Time Slot *</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Morning OPD)</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (Afternoon OPD)</option>
                  <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Chief Complaint / Medical Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild fever, persistent dry cough, chest tightness"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsBookingMode(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Appointment Booking</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">Appointment Management</h2>
            <p className="text-xs text-[#64748B]">Consultation bookings, time slots & check-in triage</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F766E]"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <Button size="sm" onClick={() => setIsBookingMode(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading appointments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] space-y-1">
            <p>No appointments found.</p>
            <p className="text-[11px] text-[#94A3B8]">Click "Book Appointment" to schedule your first consultation.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">APT ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((apt) => (
                <tr key={apt._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">{apt.appointmentId}</td>
                  <td className="py-3 px-4 font-bold text-[#16324F]">{apt.patientName}</td>
                  <td className="py-3 px-4 font-medium text-[#1F2937]">{apt.doctorName}</td>
                  <td className="py-3 px-4 text-[#64748B]">{apt.departmentName}</td>
                  <td className="py-3 px-4 text-[#1F2937]">
                    <div className="font-semibold">{apt.appointmentDate}</div>
                    <div className="text-[11px] text-[#64748B]">{apt.timeSlot}</div>
                  </td>
                  <td className="py-3 px-4">
                    {apt.tokenNumber ? (
                      <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]">
                        {apt.tokenNumber}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {apt.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(apt)}
                        className="h-7 text-[11px] px-2.5 bg-[#0F766E] gap-1"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </Button>
                    )}
                    {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(apt._id)}
                        className="p-1 rounded text-[#94A3B8] hover:text-[#B91C1C] transition-colors"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
