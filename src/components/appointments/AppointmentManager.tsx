"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Ticket,
  XCircle,
  Search,
  Loader2,
  ArrowLeft,
  Clock,
  Calendar,
  X,
  Building2,
  Stethoscope,
  AlertCircle,
  MapPin,
} from "lucide-react";
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
  hospitalId?: string;
  hospitalName?: string;
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
  hospitalId?: string;
  hospitalName?: string;
  specialization?: string;
  consultationFee?: number;
  availableDays?: string[];
  shiftHours?: {
    morningSlot?: string;
    eveningSlot?: string;
  };
  timeSlots?: string[];
  opdRoomNo?: string;
}

interface DeptOption {
  _id: string;
  name: string;
}

interface HospitalOption {
  _id: string;
  name: string;
  code: string;
  address?: {
    city?: string;
  };
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

const DEFAULT_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
];

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AppointmentManager({ currentUser }: AppointmentManagerProps) {
  const isPatientUser = currentUser?.role?.toUpperCase() === "PATIENT";

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState<string>("ALL");

  // Backend Date Filtration States
  const [dateFilter, setDateFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [datePreset, setDatePreset] = useState<"ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "CUSTOM">("ALL");

  const [isBookingMode, setIsBookingMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Booking Form State
  const [bookingHospitalId, setBookingHospitalId] = useState<string>("");
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

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<AppointmentItem | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("09:00 AM - 10:00 AM");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Backend Filter Fetcher
  const fetchAppointmentsOnly = async (
    targetDate: string,
    targetStartDate: string,
    targetEndDate: string,
    targetStatus: string,
    targetHospital: string = hospitalFilter
  ) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (targetDate) {
        params.set("date", targetDate);
      } else if (targetStartDate && targetEndDate) {
        params.set("startDate", targetStartDate);
        params.set("endDate", targetEndDate);
      }
      if (targetStatus) {
        params.set("status", targetStatus);
      }
      if (targetHospital && targetHospital !== "ALL") {
        params.set("hospitalId", targetHospital);
      }

      const aptUrl = params.toString() ? `/api/appointments?${params.toString()}` : "/api/appointments";
      const res = await fetch(aptUrl);
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.data || []);
      }
    } catch {
      console.error("Failed to filter appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetChange = (preset: "ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "CUSTOM") => {
    setDatePreset(preset);
    let targetDate = "";
    let targetStart = "";
    let targetEnd = "";

    if (preset === "TODAY") {
      targetDate = new Date().toISOString().split("T")[0];
    } else if (preset === "TOMORROW") {
      const tom = new Date(Date.now() + 86400000);
      targetDate = tom.toISOString().split("T")[0];
    } else if (preset === "THIS_WEEK") {
      targetStart = new Date().toISOString().split("T")[0];
      const end = new Date(Date.now() + 7 * 86400000);
      targetEnd = end.toISOString().split("T")[0];
    }

    setDateFilter(targetDate);
    setStartDateFilter(targetStart);
    setEndDateFilter(targetEnd);

    fetchAppointmentsOnly(targetDate, targetStart, targetEnd, statusFilter, hospitalFilter);
  };

  const handleCustomDateChange = (val: string) => {
    setDatePreset(val ? "CUSTOM" : "ALL");
    setDateFilter(val);
    setStartDateFilter("");
    setEndDateFilter("");
    fetchAppointmentsOnly(val, "", "", statusFilter, hospitalFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    fetchAppointmentsOnly(dateFilter, startDateFilter, endDateFilter, val, hospitalFilter);
  };

  const handleHospitalFilterChange = (val: string) => {
    setHospitalFilter(val);
    fetchAppointmentsOnly(dateFilter, startDateFilter, endDateFilter, statusFilter, val);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (hospitalFilter && hospitalFilter !== "ALL") params.set("hospitalId", hospitalFilter);

      const aptUrl = params.toString() ? `/api/appointments?${params.toString()}` : "/api/appointments";

      const [aptRes, docRes, deptRes, patRes, hospRes] = await Promise.all([
        fetch(aptUrl),
        fetch("/api/doctors"),
        fetch("/api/departments"),
        fetch("/api/patients"),
        fetch("/api/hospitals?status=ACTIVE"),
      ]);

      const aptData = await aptRes.json();
      const docData = await docRes.json();
      const deptData = await deptRes.json();
      const patData = await patRes.json();
      const hospData = await hospRes.json();

      if (aptRes.ok && aptData.success) setAppointments(aptData.data || []);
      if (docRes.ok && docData.success) {
        setDoctors(docData.data || []);
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
      if (hospRes.ok && hospData.success) {
        const hospList: HospitalOption[] = hospData.data || [];
        setHospitals(hospList);
        if (hospList.length > 0 && !bookingHospitalId) {
          setBookingHospitalId(hospList[0]._id);
        }
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

    // Check localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("careconnect_selected_hospital");
      if (saved && saved !== "ALL") {
        setHospitalFilter(saved);
        setBookingHospitalId(saved);
      }
    }

    const handleHospChange = (e: any) => {
      const hId = e.detail?.hospitalId;
      if (hId) {
        setHospitalFilter(hId);
        if (hId !== "ALL") setBookingHospitalId(hId);
        fetchAppointmentsOnly(dateFilter, startDateFilter, endDateFilter, statusFilter, hId);
      }
    };
    window.addEventListener("hospital-selection-change", handleHospChange);
    return () => window.removeEventListener("hospital-selection-change", handleHospChange);
  }, [currentUser]);

  // Doctors filtered by the selected hospital in booking form
  const hospitalDoctors = doctors.filter((doc) => {
    if (!bookingHospitalId || bookingHospitalId === "ALL") return true;
    return !doc.hospitalId || doc.hospitalId === bookingHospitalId;
  });

  // Further filtered by department
  const departmentAndHospitalDoctors = hospitalDoctors.filter((doc) => {
    if (!selectedDeptId) return true;
    return doc.departmentId === selectedDeptId;
  });

  // Selected doctor details
  const currentDoctor = doctors.find((d) => d._id === selectedDoctorId);

  // Available time slots for the chosen doctor
  const availableSlots =
    currentDoctor?.timeSlots && currentDoctor.timeSlots.length > 0
      ? currentDoctor.timeSlots
      : DEFAULT_SLOTS;

  // Day of week check for selected appointmentDate
  const getDayName = (dateStr: string) => {
    try {
      const parts = dateStr.split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return WEEKDAY_NAMES[d.getDay()];
    } catch {
      return "";
    }
  };

  const selectedDayName = getDayName(appointmentDate);
  const isDoctorAvailableOnDay =
    !currentDoctor?.availableDays ||
    currentDoctor.availableDays.length === 0 ||
    currentDoctor.availableDays.includes(selectedDayName);

  // Sync selected doctor when hospital or department changes
  useEffect(() => {
    if (departmentAndHospitalDoctors.length > 0) {
      const match = departmentAndHospitalDoctors.find((d) => d._id === selectedDoctorId);
      if (!match) {
        setSelectedDoctorId(departmentAndHospitalDoctors[0]._id);
      }
    } else if (hospitalDoctors.length > 0) {
      setSelectedDoctorId(hospitalDoctors[0]._id);
    }
  }, [bookingHospitalId, selectedDeptId]);

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
          hospitalId: bookingHospitalId || undefined,
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

      if (data.data?.status === "PENDING") {
        toast.success(
          `Appointment request submitted! ID: ${data.data.appointmentId}. Awaiting hospital confirmation.`
        );
      } else {
        toast.success(`Appointment confirmed! ID: ${data.data.appointmentId}`);
      }
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

  // Hospital Confirm Appointment Action
  const handleConfirmAppointment = async (aptId: string) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to confirm appointment");
      }
      toast.success("Appointment Confirmed! Patient notified.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm appointment");
    }
  };

  const handleOpenReschedule = (apt: AppointmentItem) => {
    setRescheduleApt(apt);
    setNewDate(apt.appointmentDate);
    setNewSlot(apt.timeSlot);
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !newDate) return;

    try {
      setIsRescheduling(true);
      const res = await fetch(`/api/appointments/${rescheduleApt._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: newDate,
          timeSlot: newSlot,
          status: "CONFIRMED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update timing");
      }

      toast.success("Appointment Rescheduled & Confirmed!");
      setRescheduleApt(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule appointment");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = async (aptId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to cancel appointment");
      }
      toast.success("Appointment Cancelled.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error cancelling appointment");
    }
  };

  // Client-side search filtration
  const filtered = appointments.filter((apt) => {
    if (hospitalFilter !== "ALL" && apt.hospitalId && apt.hospitalId !== hospitalFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.appointmentId.toLowerCase().includes(q) ||
      apt.doctorName.toLowerCase().includes(q) ||
      apt.departmentName.toLowerCase().includes(q) ||
      (apt.hospitalName && apt.hospitalName.toLowerCase().includes(q))
    );
  });

  const activeHospital = hospitals.find((h) => h._id === hospitalFilter);

  // =========================================================================
  // VIEW MODE: BOOKING INTERFACE (MULTI-HOSPITAL & DOCTOR AVAILABILITY)
  // =========================================================================
  if (isBookingMode) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBookingMode(false)}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#16324F] hover:bg-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#16324F]">
                {isPatientUser ? "Book Specialist Doctor Consultation" : "Schedule Patient Appointment"}
              </h2>
              <p className="text-xs text-[#64748B]">
                Select hospital branch, choose clinician, and book an available consultation slot.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBookingMode(false)}
          >
            Cancel & Return to List
          </Button>
        </div>

        <form onSubmit={handleBook} className="space-y-6 w-full">
          <FormError message={formError} />

          {/* STEP 1: Hospital Facility Selection */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F766E]" />
              <label className="text-xs font-bold text-[#16324F] uppercase tracking-wider block">
                Step 1: Select Hospital Facility Branch *
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 sm:col-span-2">
                <select
                  value={bookingHospitalId}
                  onChange={(e) => setBookingHospitalId(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-bold focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.code}) • {h.address?.city || "Chennai"}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748B]">
                  Doctors list will automatically update based on the doctors consulting at this branch.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: Patient Identification */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Step 2: Patient Identification & Contact
            </h3>

            {!isPatientUser ? (
              <div className="p-4 bg-white rounded-xl border border-teal-200/80 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-bold text-[#16324F]">
                    Select Registered Patient (Auto-fills Info)
                  </label>
                  <span className="text-[11px] text-[#0F766E] font-medium">
                    Or select &quot;Enter New / Manual Patient&quot; below
                  </span>
                </div>
                <select
                  value={selectedPatientDropdownId}
                  onChange={(e) => handlePatientDropdownChange(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
                >
                  <option value="">-- Choose Registered Patient ({registeredPatients.length} on file) --</option>
                  <option value="MANUAL">+ Enter New / Manual Patient (Walk-in)</option>
                  {registeredPatients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.phone ? `• ${p.phone}` : ""} {p.email ? `• ${p.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
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
                label="Email Address"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                disabled={isPatientUser}
              />
            </div>
          </div>

          {/* STEP 3: Department & Doctor Selection */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Step 3: Department & Specialist Doctor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Clinical Wing / Department *</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
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
                <label className="block text-xs font-semibold text-[#1F2937]">
                  Consulting Doctor at this Facility * ({departmentAndHospitalDoctors.length} available)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                >
                  {departmentAndHospitalDoctors.length === 0 ? (
                    <option value="">No doctors in this department at this branch</option>
                  ) : (
                    departmentAndHospitalDoctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} • {doc.specialization || "Specialist"} (Fee: ₹{doc.consultationFee || 500})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Doctor Duty Schedule Card Preview */}
            {currentDoctor && (
              <div className="p-4 rounded-xl bg-white border border-teal-200/90 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                    <span className="font-bold text-sm text-[#16324F]">{currentDoctor.name}</span>
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                      {currentDoctor.specialization || "Clinician"}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0F766E]">
                    Consultation Fee: ₹{currentDoctor.consultationFee || 500} • Room: {currentDoctor.opdRoomNo || "OPD"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block font-medium">Doctor Working Days:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(currentDoctor.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]).map((day) => (
                        <span
                          key={day}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#64748B] block font-medium">Duty Shift Timings:</span>
                    <span className="font-semibold text-[#16324F] block mt-1">
                      {currentDoctor.shiftHours?.morningSlot || "09:00 AM - 01:00 PM"}
                      {currentDoctor.shiftHours?.eveningSlot && ` & ${currentDoctor.shiftHours.eveningSlot}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: Date & Available Time Slot */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
              Step 4: Date & Consultation Time Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Appointment Date *</label>
                <input
                  type="date"
                  value={appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                  required
                />
                <span className="text-[11px] text-[#64748B] block">
                  Selected: <strong>{selectedDayName}</strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2937]">Appointment Mode</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1F2937] font-semibold focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="IN_PERSON">In-Person Clinical Consultation</option>
                  <option value="FOLLOW_UP">Follow-Up Review Consultation</option>
                </select>
              </div>
            </div>

            {/* Warning if doctor not available on this day */}
            {!isDoctorAvailableOnDay && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Notice:</strong> Dr. {currentDoctor?.name} is normally not on duty on{" "}
                  <strong>{selectedDayName}s</strong>. Available days:{" "}
                  {currentDoctor?.availableDays?.join(", ")}. You can still submit a request if urgent.
                </span>
              </div>
            )}

            {/* Available Time Slot Buttons */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-[#1F2937]">
                Doctor Available Time Slots * (Select preferred slot)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#0F766E] border-[#0F766E] text-white shadow-xs"
                          : "bg-white border-[#CBD5E1] text-[#16324F] hover:border-teal-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Input
                label="Chief Complaint / Medical Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mild fever, persistent dry cough, chest tightness"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={isSubmitting || departmentAndHospitalDoctors.length === 0}
              className="bg-[#0F766E] hover:bg-[#115E59] text-xs font-bold gap-2 px-8 text-white shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPatientUser ? "Submit Appointment Request" : "Confirm Appointment Booking"}</span>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: APPOINTMENTS TABLE LIST
  // =========================================================================
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#16324F]">Appointment Desk</h2>
            <p className="text-xs text-[#64748B]">
              Multi-facility consultation bookings, doctor slot schedules & patient triage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hospital Filter Dropdown */}
          <select
            value={hospitalFilter}
            onChange={(e) => handleHospitalFilterChange(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-semibold text-[#16324F] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Hospital Facilities</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>

          {/* Backend Date Filtration */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1">
            <div className="flex items-center gap-1 pl-2 pr-1 text-[#0F766E]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden md:inline">Date:</span>
            </div>

            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value as any)}
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-lg font-semibold text-[#16324F] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="TOMORROW">Tomorrow</option>
              <option value="THIS_WEEK">Next 7 Days</option>
              <option value="CUSTOM">Specific Date</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-lg font-semibold text-[#16324F] focus:outline-none focus:border-[#0F766E]"
            />

            {(dateFilter || startDateFilter) && (
              <button
                type="button"
                onClick={() => handlePresetChange("ALL")}
                className="p-1 rounded-md text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Clear Date Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-medium text-[#16324F] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0F766E] w-40 sm:w-52"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsBookingMode(true)}
            className="gap-2 shrink-0 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{isPatientUser ? "Book Consultation" : "Book Appointment"}</span>
          </Button>
        </div>
      </div>

      {/* Hospital Filter Banner if active */}
      {hospitalFilter !== "ALL" && activeHospital && (
        <div className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>
              Filtered by branch: <strong>{activeHospital.name}</strong> ({activeHospital.code})
            </span>
          </div>
          <button
            onClick={() => handleHospitalFilterChange("ALL")}
            className="text-[11px] font-bold text-teal-700 hover:underline"
          >
            Clear (Show All Facilities)
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
            <span>Loading appointments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] space-y-1">
            <p>No appointments found for the selected hospital or filters.</p>
            <p className="text-[11px] text-[#94A3B8]">
              Click &quot;Book Consultation&quot; to schedule your appointment.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">APT ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Hospital Facility</th>
                <th className="py-3 px-4">Doctor & Specialization</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.map((apt) => (
                <tr key={apt._id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                    {apt.appointmentId}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#16324F]">
                    {apt.patientName}
                  </td>

                  {/* Hospital Branch */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#16324F] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {apt.hospitalName || "CareConnect Main"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-[#1F2937]">
                    {apt.doctorName}
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{apt.departmentName}</td>
                  <td className="py-3 px-4 text-[#1F2937]">
                    <div className="font-semibold">{apt.appointmentDate}</div>
                    <div className="text-[11px] text-[#64748B]">{apt.timeSlot}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={apt.status}
                      labelMap={{
                        PENDING: "Pending",
                        CONFIRMED: "Confirmed",
                        CHECKED_IN: "Checked In",
                        IN_CONSULTATION: "Consulting",
                        COMPLETED: "Completed",
                        CANCELLED: "Cancelled",
                      }}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isPatientUser && apt.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAppointment(apt._id)}
                          className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          Confirm
                        </Button>
                      )}

                      {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReschedule(apt)}
                          className="h-7 text-[11px] px-2"
                        >
                          Reschedule
                        </Button>
                      )}

                      {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(apt._id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Cancel Appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#16324F]">
                Reschedule {rescheduleApt.appointmentId}
              </h3>
              <button
                onClick={() => setRescheduleApt(null)}
                className="text-[#94A3B8] hover:text-[#16324F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#1F2937] block mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1F2937] block mb-1">New Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full h-10 px-3 border border-[#CBD5E1] rounded-xl font-semibold"
                >
                  {DEFAULT_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleApt(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isRescheduling}
                  className="bg-[#0F766E] text-white"
                >
                  {isRescheduling ? "Saving..." : "Save Reschedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
