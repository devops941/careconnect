import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";
import { Department } from "../src/models/Department";
import { Doctor } from "../src/models/Doctor";
import { Patient } from "../src/models/Patient";
import { Appointment } from "../src/models/Appointment";
import { QueueToken } from "../src/models/QueueToken";
import { Invoice } from "../src/models/Invoice";
import { DoctorSchedule } from "../src/models/DoctorSchedule";
import { Feedback } from "../src/models/Feedback";
import { Prescription } from "../src/models/Prescription";

async function seed() {
  console.log("=====================================================================");
  console.log("  🏥 CareConnect Enterprise - 10 Records Live Data Population Runner  ");
  console.log("=====================================================================\n");

  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB successfully.\n");

    // =========================================================================
    // 1. DEPARTMENTS (10 Records)
    // =========================================================================
    console.log("1. Seeding 10 Hospital Departments...");
    await Department.deleteMany({});
    const departmentsData = [
      { deptId: "CARD", name: "Cardiology", description: "Comprehensive heart, vascular and coronary care", opdRoomNo: "Room 201", status: "ACTIVE" as const },
      { deptId: "NEUR", name: "Neurology", description: "Brain, spine, stroke and nervous system interventions", opdRoomNo: "Room 302", status: "ACTIVE" as const },
      { deptId: "ORTH", name: "Orthopedics", description: "Joint replacements, sports injuries and trauma fracture care", opdRoomNo: "Room 105", status: "ACTIVE" as const },
      { deptId: "PEDI", name: "Pediatrics", description: "Child wellness, newborn ICU and pediatric surgery", opdRoomNo: "Room 102", status: "ACTIVE" as const },
      { deptId: "GMED", name: "General Medicine", description: "Internal medicine, fever, diabetes and hypertension management", opdRoomNo: "Room 101", status: "ACTIVE" as const },
      { deptId: "DERM", name: "Dermatology", description: "Skin, hair, aesthetic procedures and allergy treatments", opdRoomNo: "Room 205", status: "ACTIVE" as const },
      { deptId: "OPHT", name: "Ophthalmology", description: "Cataract, refractive laser surgery and retina clinic", opdRoomNo: "Room 112", status: "ACTIVE" as const },
      { deptId: "ENT", name: "ENT (Otolaryngology)", description: "Ear microsurgery, sinus endoscopy and speech therapy", opdRoomNo: "Room 115", status: "ACTIVE" as const },
      { deptId: "OBGY", name: "Obstetrics & Gynecology", description: "Maternity care, fetal medicine and women wellness", opdRoomNo: "Room 304", status: "ACTIVE" as const },
      { deptId: "ONCO", name: "Oncology", description: "Medical, radiation and surgical cancer care", opdRoomNo: "Room 401", status: "ACTIVE" as const },
    ];
    const departments = await Department.insertMany(departmentsData);
    console.log(`   ✓ Inserted ${departments.length} departments.\n`);

    // =========================================================================
    // 2. DOCTORS (10 Specialists)
    // =========================================================================
    console.log("2. Seeding 10 Specialist Doctors...");
    await Doctor.deleteMany({});
    const doctorsData = [
      {
        doctorId: "DOC-2026-001",
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@careconnect.health",
        phone: "+91 98401 23450",
        specialization: "Interventional Cardiologist",
        departmentId: departments[0]._id,
        departmentName: departments[0].name,
        qualification: "MBBS, MD (Cardiology), DM",
        experienceYears: 14,
        consultationFee: 750,
        opdRoomNo: "Room 201",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["09:00 AM - 01:00 PM", "05:00 PM - 08:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-002",
        name: "Dr. Rajesh Sundaram",
        email: "rajesh.sundaram@careconnect.health",
        phone: "+91 98402 34561",
        specialization: "Senior Neurologist",
        departmentId: departments[1]._id,
        departmentName: departments[1].name,
        qualification: "MBBS, MD, DM (Neurology)",
        experienceYears: 18,
        consultationFee: 850,
        opdRoomNo: "Room 302",
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        timeSlots: ["10:00 AM - 02:00 PM", "06:00 PM - 09:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-003",
        name: "Dr. Vikram Sethi",
        email: "vikram.sethi@careconnect.health",
        phone: "+91 98403 45672",
        specialization: "Orthopedic & Joint Surgeon",
        departmentId: departments[2]._id,
        departmentName: departments[2].name,
        qualification: "MBBS, MS (Ortho), MCh",
        experienceYears: 12,
        consultationFee: 650,
        opdRoomNo: "Room 105",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: ["09:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-004",
        name: "Dr. Ananya Natarajan",
        email: "ananya.natarajan@careconnect.health",
        phone: "+91 98404 56783",
        specialization: "Senior Pediatrician",
        departmentId: departments[3]._id,
        departmentName: departments[3].name,
        qualification: "MBBS, DCH, MD (Pediatrics)",
        experienceYears: 10,
        consultationFee: 500,
        opdRoomNo: "Room 102",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        timeSlots: ["09:00 AM - 01:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-005",
        name: "Dr. Arvind Swaminathan",
        email: "arvind.swaminathan@careconnect.health",
        phone: "+91 98405 67894",
        specialization: "General Physician",
        departmentId: departments[4]._id,
        departmentName: departments[4].name,
        qualification: "MBBS, MD (General Medicine)",
        experienceYears: 16,
        consultationFee: 450,
        opdRoomNo: "Room 101",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["08:30 AM - 01:30 PM", "05:00 PM - 08:30 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-006",
        name: "Dr. Meera Vasudevan",
        email: "meera.vasudevan@careconnect.health",
        phone: "+91 98406 78905",
        specialization: "Cosmetic Dermatologist",
        departmentId: departments[5]._id,
        departmentName: departments[5].name,
        qualification: "MBBS, MD (Dermatology)",
        experienceYears: 8,
        consultationFee: 600,
        opdRoomNo: "Room 205",
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: ["10:00 AM - 02:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-007",
        name: "Dr. Pradeep Nair",
        email: "pradeep.nair@careconnect.health",
        phone: "+91 98407 89016",
        specialization: "Ophthalmic Surgeon",
        departmentId: departments[6]._id,
        departmentName: departments[6].name,
        qualification: "MBBS, MS (Ophthalmology)",
        experienceYears: 15,
        consultationFee: 550,
        opdRoomNo: "Room 112",
        availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
        timeSlots: ["09:00 AM - 01:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-008",
        name: "Dr. Harish Raghavan",
        email: "harish.raghavan@careconnect.health",
        phone: "+91 98408 90127",
        specialization: "ENT Head & Neck Specialist",
        departmentId: departments[7]._id,
        departmentName: departments[7].name,
        qualification: "MBBS, DLO, MS (ENT)",
        experienceYears: 11,
        consultationFee: 500,
        opdRoomNo: "Room 115",
        availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["02:00 PM - 06:00 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-009",
        name: "Dr. Shalini Mukerjee",
        email: "shalini.mukerjee@careconnect.health",
        phone: "+91 98409 01238",
        specialization: "Consultant Obstetrician",
        departmentId: departments[8]._id,
        departmentName: departments[8].name,
        qualification: "MBBS, DGO, MD (OBGY)",
        experienceYears: 14,
        consultationFee: 700,
        opdRoomNo: "Room 304",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
        timeSlots: ["09:30 AM - 01:30 PM", "04:30 PM - 07:30 PM"],
        status: "ACTIVE",
      },
      {
        doctorId: "DOC-2026-010",
        name: "Dr. Gautam Bannerjee",
        email: "gautam.bannerjee@careconnect.health",
        phone: "+91 98410 12349",
        specialization: "Medical Oncologist",
        departmentId: departments[9]._id,
        departmentName: departments[9].name,
        qualification: "MBBS, MD, DM (Medical Oncology)",
        experienceYears: 20,
        consultationFee: 950,
        opdRoomNo: "Room 401",
        availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["10:00 AM - 03:00 PM"],
        status: "ACTIVE",
      },
    ];
    const doctors = await Doctor.insertMany(doctorsData);
    console.log(`   ✓ Inserted ${doctors.length} specialist doctors.\n`);

    // =========================================================================
    // 3. REGISTERED PATIENTS (10 Patients)
    // =========================================================================
    console.log("3. Seeding 10 Registered Patients...");
    await Patient.deleteMany({});
    const patientsData = [
      { name: "Arunachalam Murugesan", email: "arunachalam@example.com", normalizedEmail: "arunachalam@example.com", phone: "+91 98765 43210", bloodGroup: "O+", gender: "MALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Lakshmi Priya", email: "lakshmi.priya@example.com", normalizedEmail: "lakshmi.priya@example.com", phone: "+91 98765 43211", bloodGroup: "B+", gender: "FEMALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Karthik Subramanian", email: "karthik.s@example.com", normalizedEmail: "karthik.s@example.com", phone: "+91 98765 43212", bloodGroup: "A+", gender: "MALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Deepa Narayanan", email: "deepa.n@example.com", normalizedEmail: "deepa.n@example.com", phone: "+91 98765 43213", bloodGroup: "AB+", gender: "FEMALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Suresh Balaji", email: "suresh.balaji@example.com", normalizedEmail: "suresh.balaji@example.com", phone: "+91 98765 43214", bloodGroup: "O-", gender: "MALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Meenakshi Sundaram", email: "meenakshi.s@example.com", normalizedEmail: "meenakshi.s@example.com", phone: "+91 98765 43215", bloodGroup: "A-", gender: "FEMALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Venkatesh Raman", email: "venkatesh.r@example.com", normalizedEmail: "venkatesh.r@example.com", phone: "+91 98765 43216", bloodGroup: "B-", gender: "MALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Geetha Krishnan", email: "geetha.k@example.com", normalizedEmail: "geetha.k@example.com", phone: "+91 98765 43217", bloodGroup: "O+", gender: "FEMALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Dinesh Kumar", email: "dinesh.kumar@example.com", normalizedEmail: "dinesh.kumar@example.com", phone: "+91 98765 43218", bloodGroup: "AB-", gender: "MALE", status: "ACTIVE", authProviders: ["credentials"] },
      { name: "Radha Padmanabhan", email: "radha.p@example.com", normalizedEmail: "radha.p@example.com", phone: "+91 98765 43219", bloodGroup: "A+", gender: "FEMALE", status: "ACTIVE", authProviders: ["credentials"] },
    ];
    const patients = await Patient.insertMany(patientsData);
    console.log(`   ✓ Inserted ${patients.length} registered patients.\n`);

    // =========================================================================
    // 4. APPOINTMENTS (10 Records)
    // =========================================================================
    console.log("4. Seeding 10 Hospital Appointments...");
    await Appointment.deleteMany({});
    const today = new Date().toISOString().split("T")[0];
    const appointmentsData = [
      { appointmentId: "APT-2026-1001", patientId: patients[0]._id, patientName: patients[0].name, patientPhone: patients[0].phone, patientEmail: patients[0].email, doctorId: doctors[0]._id, doctorName: doctors[0].name, departmentId: departments[0]._id, departmentName: departments[0].name, appointmentDate: today, timeSlot: "09:00 AM - 10:00 AM", type: "IN_PERSON", status: "CHECKED_IN", notes: "Routine cardiac check-up & ECG analysis" },
      { appointmentId: "APT-2026-1002", patientId: patients[1]._id, patientName: patients[1].name, patientPhone: patients[1].phone, patientEmail: patients[1].email, doctorId: doctors[1]._id, doctorName: doctors[1].name, departmentId: departments[1]._id, departmentName: departments[1].name, appointmentDate: today, timeSlot: "10:00 AM - 11:00 AM", type: "IN_PERSON", status: "CONFIRMED", notes: "Persistent migraines and cervical stiffness" },
      { appointmentId: "APT-2026-1003", patientId: patients[2]._id, patientName: patients[2].name, patientPhone: patients[2].phone, patientEmail: patients[2].email, doctorId: doctors[2]._id, doctorName: doctors[2].name, departmentId: departments[2]._id, departmentName: departments[2].name, appointmentDate: today, timeSlot: "11:00 AM - 12:00 PM", type: "FOLLOW_UP", status: "CONFIRMED", notes: "Post-knee arthroscopy follow-up examination" },
      { appointmentId: "APT-2026-1004", patientId: patients[3]._id, patientName: patients[3].name, patientPhone: patients[3].phone, patientEmail: patients[3].email, doctorId: doctors[3]._id, doctorName: doctors[3].name, departmentId: departments[3]._id, departmentName: departments[3].name, appointmentDate: today, timeSlot: "09:00 AM - 10:00 AM", type: "IN_PERSON", status: "COMPLETED", notes: "Child vaccination and growth chart evaluation" },
      { appointmentId: "APT-2026-1005", patientId: patients[4]._id, patientName: patients[4].name, patientPhone: patients[4].phone, patientEmail: patients[4].email, doctorId: doctors[4]._id, doctorName: doctors[4].name, departmentId: departments[4]._id, departmentName: departments[4].name, appointmentDate: today, timeSlot: "02:00 PM - 03:00 PM", type: "IN_PERSON", status: "SCHEDULED", notes: "Seasonal viral fever with high chills" },
      { appointmentId: "APT-2026-1006", patientId: patients[5]._id, patientName: patients[5].name, patientPhone: patients[5].phone, patientEmail: patients[5].email, doctorId: doctors[5]._id, doctorName: doctors[5].name, departmentId: departments[5]._id, departmentName: departments[5].name, appointmentDate: today, timeSlot: "10:00 AM - 11:00 AM", type: "IN_PERSON", status: "CONFIRMED", notes: "Dermatitis flare-up and cosmetic skin assessment" },
      { appointmentId: "APT-2026-1007", patientId: patients[6]._id, patientName: patients[6].name, patientPhone: patients[6].phone, patientEmail: patients[6].email, doctorId: doctors[6]._id, doctorName: doctors[6].name, departmentId: departments[6]._id, departmentName: departments[6].name, appointmentDate: today, timeSlot: "11:00 AM - 12:00 PM", type: "IN_PERSON", status: "CONFIRMED", notes: "Blurred distance vision and dry eye syndrome" },
      { appointmentId: "APT-2026-1008", patientId: patients[7]._id, patientName: patients[7].name, patientPhone: patients[7].phone, patientEmail: patients[7].email, doctorId: doctors[7]._id, doctorName: doctors[7].name, departmentId: departments[7]._id, departmentName: departments[7].name, appointmentDate: today, timeSlot: "03:00 PM - 04:00 PM", type: "IN_PERSON", status: "SCHEDULED", notes: "Chronic allergic sinusitis and nasal congestion" },
      { appointmentId: "APT-2026-1009", patientId: patients[8]._id, patientName: patients[8].name, patientPhone: patients[8].phone, patientEmail: patients[8].email, doctorId: doctors[8]._id, doctorName: doctors[8].name, departmentId: departments[8]._id, departmentName: departments[8].name, appointmentDate: today, timeSlot: "09:30 AM - 10:30 AM", type: "FOLLOW_UP", status: "COMPLETED", notes: "Second trimester anomaly ultrasound scan review" },
      { appointmentId: "APT-2026-1010", patientId: patients[9]._id, patientName: patients[9].name, patientPhone: patients[9].phone, patientEmail: patients[9].email, doctorId: doctors[9]._id, doctorName: doctors[9].name, departmentId: departments[9]._id, departmentName: departments[9].name, appointmentDate: today, timeSlot: "11:00 AM - 12:00 PM", type: "IN_PERSON", status: "CONFIRMED", notes: "Oncology second opinion and biopsy report consultation" },
    ];
    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`   ✓ Inserted ${appointments.length} appointments.\n`);

    // =========================================================================
    // 5. QUEUE TOKENS (10 Live Tokens)
    // =========================================================================
    console.log("5. Seeding 10 Live Queue Tokens...");
    await QueueToken.deleteMany({});
    const queueTokensData = [
      { tokenNumber: "A-01", tokenSequence: 1, tokenDate: today, patientName: patients[0].name, patientId: patients[0]._id, doctorId: doctors[0]._id, doctorName: doctors[0].name, departmentId: departments[0]._id, departmentName: departments[0].name, opdRoomNo: "Room 201", priority: "NORMAL", status: "IN_CONSULTATION" },
      { tokenNumber: "A-02", tokenSequence: 2, tokenDate: today, patientName: patients[1].name, patientId: patients[1]._id, doctorId: doctors[1]._id, doctorName: doctors[1].name, departmentId: departments[1]._id, departmentName: departments[1].name, opdRoomNo: "Room 302", priority: "NORMAL", status: "CALLED" },
      { tokenNumber: "A-03", tokenSequence: 3, tokenDate: today, patientName: patients[2].name, patientId: patients[2]._id, doctorId: doctors[2]._id, doctorName: doctors[2].name, departmentId: departments[2]._id, departmentName: departments[2].name, opdRoomNo: "Room 105", priority: "EMERGENCY", status: "WAITING" },
      { tokenNumber: "A-04", tokenSequence: 4, tokenDate: today, patientName: patients[3].name, patientId: patients[3]._id, doctorId: doctors[3]._id, doctorName: doctors[3].name, departmentId: departments[3]._id, departmentName: departments[3].name, opdRoomNo: "Room 102", priority: "NORMAL", status: "COMPLETED" },
      { tokenNumber: "A-05", tokenSequence: 5, tokenDate: today, patientName: patients[4].name, patientId: patients[4]._id, doctorId: doctors[4]._id, doctorName: doctors[4].name, departmentId: departments[4]._id, departmentName: departments[4].name, opdRoomNo: "Room 101", priority: "NORMAL", status: "WAITING" },
      { tokenNumber: "A-06", tokenSequence: 6, tokenDate: today, patientName: patients[5].name, patientId: patients[5]._id, doctorId: doctors[5]._id, doctorName: doctors[5].name, departmentId: departments[5]._id, departmentName: departments[5].name, opdRoomNo: "Room 205", priority: "NORMAL", status: "WAITING" },
      { tokenNumber: "A-07", tokenSequence: 7, tokenDate: today, patientName: patients[6].name, patientId: patients[6]._id, doctorId: doctors[6]._id, doctorName: doctors[6].name, departmentId: departments[6]._id, departmentName: departments[6].name, opdRoomNo: "Room 112", priority: "NORMAL", status: "WAITING" },
      { tokenNumber: "A-08", tokenSequence: 8, tokenDate: today, patientName: patients[7].name, patientId: patients[7]._id, doctorId: doctors[7]._id, doctorName: doctors[7].name, departmentId: departments[7]._id, departmentName: departments[7].name, opdRoomNo: "Room 115", priority: "NORMAL", status: "WAITING" },
      { tokenNumber: "A-09", tokenSequence: 9, tokenDate: today, patientName: patients[8].name, patientId: patients[8]._id, doctorId: doctors[8]._id, doctorName: doctors[8].name, departmentId: departments[8]._id, departmentName: departments[8].name, opdRoomNo: "Room 304", priority: "NORMAL", status: "COMPLETED" },
      { tokenNumber: "A-10", tokenSequence: 10, tokenDate: today, patientName: patients[9].name, patientId: patients[9]._id, doctorId: doctors[9]._id, doctorName: doctors[9].name, departmentId: departments[9]._id, departmentName: departments[9].name, opdRoomNo: "Room 401", priority: "NORMAL", status: "WAITING" },
    ];
    const tokens = await QueueToken.insertMany(queueTokensData);
    console.log(`   ✓ Inserted ${tokens.length} live queue tokens.\n`);

    // =========================================================================
    // 6. INVOICES & BILLS (10 Records)
    // =========================================================================
    console.log("6. Seeding 10 Financial Tax Invoices & Receipts...");
    await Invoice.deleteMany({});
    const invoicesData = [
      {
        invoiceNumber: "INV-2026-0001-3819",
        patientId: patients[0]._id,
        patientName: patients[0].name,
        patientPhone: patients[0].phone,
        patientEmail: patients[0].email,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        departmentName: departments[0].name,
        queueTokenNumber: "A-01",
        items: [
          { description: "Cardiology Specialist OPD Consultation", category: "CONSULTATION", unitPrice: 750, quantity: 1, total: 750 },
          { description: "Hospital OPD Registration & Card Charges", category: "REGISTRATION", unitPrice: 100, quantity: 1, total: 100 },
        ],
        subtotal: 850,
        discount: 0,
        tax: 0,
        totalAmount: 850,
        paidAmount: 850,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        transactionId: "UPI-409182741029",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0002-4912",
        patientId: patients[1]._id,
        patientName: patients[1].name,
        patientPhone: patients[1].phone,
        patientEmail: patients[1].email,
        doctorId: doctors[1]._id,
        doctorName: doctors[1].name,
        departmentName: departments[1].name,
        queueTokenNumber: "A-02",
        items: [
          { description: "Neurology Comprehensive Consultation", category: "CONSULTATION", unitPrice: 850, quantity: 1, total: 850 },
          { description: "Hospital OPD Registration & Card Charges", category: "REGISTRATION", unitPrice: 100, quantity: 1, total: 100 },
        ],
        subtotal: 950,
        discount: 0,
        tax: 0,
        totalAmount: 950,
        paidAmount: 950,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0003-8821",
        patientId: patients[2]._id,
        patientName: patients[2].name,
        patientPhone: patients[2].phone,
        doctorId: doctors[2]._id,
        doctorName: doctors[2].name,
        departmentName: departments[2].name,
        queueTokenNumber: "A-03",
        items: [
          { description: "Orthopedic Surgeon Consultation", category: "CONSULTATION", unitPrice: 650, quantity: 1, total: 650 },
          { description: "Digital X-Ray Knee AP & Lateral Views", category: "LAB", unitPrice: 400, quantity: 1, total: 400 },
        ],
        subtotal: 1050,
        discount: 50,
        tax: 0,
        totalAmount: 1000,
        paidAmount: 0,
        balanceDue: 1000,
        paymentStatus: "PENDING",
        paymentMethod: "UNPAID",
        cashierName: "Front Desk Cashier 2",
        issuedAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0004-7192",
        patientId: patients[3]._id,
        patientName: patients[3].name,
        doctorId: doctors[3]._id,
        doctorName: doctors[3].name,
        departmentName: departments[3].name,
        queueTokenNumber: "A-04",
        items: [
          { description: "Pediatric Consultation & Immunization", category: "CONSULTATION", unitPrice: 500, quantity: 1, total: 500 },
          { description: "MMR Vaccine Dose", category: "PHARMACY", unitPrice: 800, quantity: 1, total: 800 },
        ],
        subtotal: 1300,
        discount: 0,
        tax: 0,
        totalAmount: 1300,
        paidAmount: 1300,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "CARD",
        transactionId: "POS-TXN-90218",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0005-5512",
        patientId: patients[4]._id,
        patientName: patients[4].name,
        doctorId: doctors[4]._id,
        doctorName: doctors[4].name,
        departmentName: departments[4].name,
        queueTokenNumber: "A-05",
        items: [
          { description: "General Medicine Outpatient Consultation", category: "CONSULTATION", unitPrice: 450, quantity: 1, total: 450 },
          { description: "Complete Blood Count (CBC) Lab Panel", category: "LAB", unitPrice: 350, quantity: 1, total: 350 },
        ],
        subtotal: 800,
        discount: 0,
        tax: 0,
        totalAmount: 800,
        paidAmount: 0,
        balanceDue: 800,
        paymentStatus: "PENDING",
        paymentMethod: "UNPAID",
        cashierName: "Front Desk Cashier 2",
        issuedAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0006-2091",
        patientId: patients[5]._id,
        patientName: patients[5].name,
        doctorId: doctors[5]._id,
        doctorName: doctors[5].name,
        departmentName: departments[5].name,
        queueTokenNumber: "A-06",
        items: [
          { description: "Dermatology Clinic Consultation", category: "CONSULTATION", unitPrice: 600, quantity: 1, total: 600 },
          { description: "Skin Allergy Patch Test", category: "PROCEDURE", unitPrice: 900, quantity: 1, total: 900 },
        ],
        subtotal: 1500,
        discount: 100,
        tax: 0,
        totalAmount: 1400,
        paidAmount: 1400,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        transactionId: "UPI-884910284719",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0007-9912",
        patientId: patients[6]._id,
        patientName: patients[6].name,
        doctorId: doctors[6]._id,
        doctorName: doctors[6].name,
        departmentName: departments[6].name,
        queueTokenNumber: "A-07",
        items: [
          { description: "Ophthalmology Eye Examination & Fundus Scan", category: "CONSULTATION", unitPrice: 550, quantity: 1, total: 550 },
        ],
        subtotal: 550,
        discount: 0,
        tax: 0,
        totalAmount: 550,
        paidAmount: 550,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        cashierName: "Front Desk Cashier 2",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0008-1182",
        patientId: patients[7]._id,
        patientName: patients[7].name,
        doctorId: doctors[7]._id,
        doctorName: doctors[7].name,
        departmentName: departments[7].name,
        queueTokenNumber: "A-08",
        items: [
          { description: "ENT Diagnostic Endoscopy & Consultation", category: "CONSULTATION", unitPrice: 500, quantity: 1, total: 500 },
          { description: "Diagnostic Nasal Endoscopy", category: "PROCEDURE", unitPrice: 650, quantity: 1, total: 650 },
        ],
        subtotal: 1150,
        discount: 0,
        tax: 0,
        totalAmount: 1150,
        paidAmount: 0,
        balanceDue: 1150,
        paymentStatus: "PENDING",
        paymentMethod: "UNPAID",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0009-3321",
        patientId: patients[8]._id,
        patientName: patients[8].name,
        doctorId: doctors[8]._id,
        doctorName: doctors[8].name,
        departmentName: departments[8].name,
        queueTokenNumber: "A-09",
        items: [
          { description: "Antenatal Maternity Consultation", category: "CONSULTATION", unitPrice: 700, quantity: 1, total: 700 },
          { description: "Obstetric Anomaly Ultrasound Scan", category: "LAB", unitPrice: 1200, quantity: 1, total: 1200 },
        ],
        subtotal: 1900,
        discount: 0,
        tax: 0,
        totalAmount: 1900,
        paidAmount: 1900,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        transactionId: "UPI-918274619482",
        cashierName: "Front Desk Cashier 1",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-0010-6641",
        patientId: patients[9]._id,
        patientName: patients[9].name,
        doctorId: doctors[9]._id,
        doctorName: doctors[9].name,
        departmentName: departments[9].name,
        queueTokenNumber: "A-10",
        items: [
          { description: "Oncology Comprehensive Specialist Consultation", category: "CONSULTATION", unitPrice: 950, quantity: 1, total: 950 },
        ],
        subtotal: 950,
        discount: 0,
        tax: 0,
        totalAmount: 950,
        paidAmount: 950,
        balanceDue: 0,
        paymentStatus: "PAID",
        paymentMethod: "CARD",
        transactionId: "POS-TXN-11029",
        cashierName: "Front Desk Cashier 2",
        issuedAt: new Date(),
        paidAt: new Date(),
      },
    ];
    const invoices = await Invoice.insertMany(invoicesData);
    console.log(`   ✓ Inserted ${invoices.length} invoices and receipts.\n`);

    // =========================================================================
    // 7. DOCTOR SCHEDULES & LEAVES (10 Records)
    // =========================================================================
    console.log("7. Seeding 10 Doctor Schedules, Shifts & Leave Applications...");
    await DoctorSchedule.deleteMany({});
    const schedulesData = [
      { doctorId: doctors[0]._id, doctorName: doctors[0].name, departmentName: departments[0].name, leaveType: "CONFERENCE", startDate: "2026-10-20", endDate: "2026-10-22", reason: "Attending World Congress of Cardiology in Dubai", status: "APPROVED", replacementDoctorName: "Dr. Arvind Swaminathan" },
      { doctorId: doctors[1]._id, doctorName: doctors[1].name, departmentName: departments[1].name, leaveType: "CASUAL", startDate: "2026-10-25", endDate: "2026-10-26", reason: "Family wedding commitment", status: "APPROVED", replacementDoctorName: "Dr. Rajesh Sundaram" },
      { doctorId: doctors[2]._id, doctorName: doctors[2].name, departmentName: departments[2].name, leaveType: "MEDICAL", startDate: "2026-10-18", endDate: "2026-10-19", reason: "Post-surgery recovery follow-up", status: "PENDING" },
      { doctorId: doctors[3]._id, doctorName: doctors[3].name, departmentName: departments[3].name, leaveType: "CONFERENCE", startDate: "2026-11-05", endDate: "2026-11-07", reason: "Pediatric Critical Care Workshop in Delhi", status: "APPROVED" },
      { doctorId: doctors[4]._id, doctorName: doctors[4].name, departmentName: departments[4].name, leaveType: "CASUAL", startDate: "2026-10-28", endDate: "2026-10-29", reason: "Personal annual leave", status: "PENDING" },
      { doctorId: doctors[5]._id, doctorName: doctors[5].name, departmentName: departments[5].name, leaveType: "EMERGENCY", startDate: "2026-10-16", endDate: "2026-10-17", reason: "Family emergency", status: "APPROVED", replacementDoctorName: "Dr. Meera Vasudevan" },
      { doctorId: doctors[6]._id, doctorName: doctors[6].name, departmentName: departments[6].name, leaveType: "CONFERENCE", startDate: "2026-11-12", endDate: "2026-11-14", reason: "Ophthalmic Laser Innovations Summit", status: "PENDING" },
      { doctorId: doctors[7]._id, doctorName: doctors[7].name, departmentName: departments[7].name, leaveType: "CASUAL", startDate: "2026-10-24", endDate: "2026-10-24", reason: "Doctor personal leave", status: "APPROVED" },
      { doctorId: doctors[8]._id, doctorName: doctors[8].name, departmentName: departments[8].name, leaveType: "MEDICAL", startDate: "2026-11-01", endDate: "2026-11-03", reason: "Health wellness leave", status: "APPROVED" },
      { doctorId: doctors[9]._id, doctorName: doctors[9].name, departmentName: departments[9].name, leaveType: "CONFERENCE", startDate: "2026-11-20", endDate: "2026-11-23", reason: "International Cancer Research Symposium", status: "APPROVED" },
    ];
    const schedules = await DoctorSchedule.insertMany(schedulesData);
    console.log(`   ✓ Inserted ${schedules.length} doctor schedule & leave records.\n`);

    // =========================================================================
    // 8. PATIENT FEEDBACK & DOCTOR RATINGS (10 Records)
    // =========================================================================
    console.log("8. Seeding 10 Patient Feedback & Ratings...");
    await Feedback.deleteMany({});
    const feedbacksData = [
      { patientId: patients[0]._id, patientName: patients[0].name, doctorId: doctors[0]._id, doctorName: doctors[0].name, departmentName: departments[0].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Dr. Sarah Jenkins is exceptionally attentive and explained the ECG results thoroughly. Very minimal waiting time!", status: "PUBLISHED" },
      { patientId: patients[1]._id, patientName: patients[1].name, doctorId: doctors[1]._id, doctorName: doctors[1].name, departmentName: departments[1].name, rating: 5, waitingTimeRating: 4, cleanlinessRating: 5, comments: "Dr. Rajesh diagnosed my persistent migraine accurately. The medications provided instant relief. Excellent service.", status: "PUBLISHED" },
      { patientId: patients[2]._id, patientName: patients[2].name, doctorId: doctors[2]._id, doctorName: doctors[2].name, departmentName: departments[2].name, rating: 4, waitingTimeRating: 4, cleanlinessRating: 5, comments: "Dr. Vikram was very encouraging throughout my knee rehab. Hospital staff were polite and well-organized.", status: "PUBLISHED" },
      { patientId: patients[3]._id, patientName: patients[3].name, doctorId: doctors[3]._id, doctorName: doctors[3].name, departmentName: departments[3].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Dr. Ananya is wonderful with children. My toddler didn't cry at all during the vaccination. Top pediatric clinic!", status: "PUBLISHED" },
      { patientId: patients[4]._id, patientName: patients[4].name, doctorId: doctors[4]._id, doctorName: doctors[4].name, departmentName: departments[4].name, rating: 5, waitingTimeRating: 4, cleanlinessRating: 5, comments: "Dr. Arvind has a calm and reassuring manner. Clear prescription with dosage instructions printed neatly.", status: "PUBLISHED" },
      { patientId: patients[5]._id, patientName: patients[5].name, doctorId: doctors[5]._id, doctorName: doctors[5].name, departmentName: departments[5].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Excellent dermatology consultation with Dr. Meera. The patch test procedure was smooth and painless.", status: "PUBLISHED" },
      { patientId: patients[6]._id, patientName: patients[6].name, doctorId: doctors[6]._id, doctorName: doctors[6].name, departmentName: departments[6].name, rating: 4, waitingTimeRating: 4, cleanlinessRating: 4, comments: "Dr. Pradeep examined both eyes thoroughly. Modern equipment in OPD Room 112.", status: "PUBLISHED" },
      { patientId: patients[7]._id, patientName: patients[7].name, doctorId: doctors[7]._id, doctorName: doctors[7].name, departmentName: departments[7].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Nasal endoscopy showed the exact sinus block. Clear treatment path explained by Dr. Harish.", status: "PUBLISHED" },
      { patientId: patients[8]._id, patientName: patients[8].name, doctorId: doctors[8]._id, doctorName: doctors[8].name, departmentName: departments[8].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Dr. Shalini is very kind and patient with all our pregnancy queries. Ultra-clean clinic environment.", status: "PUBLISHED" },
      { patientId: patients[9]._id, patientName: patients[9].name, doctorId: doctors[9]._id, doctorName: doctors[9].name, departmentName: departments[9].name, rating: 5, waitingTimeRating: 5, cleanlinessRating: 5, comments: "Second opinion from Dr. Gautam was extremely clear and gave our family immense confidence. Outstanding physician.", status: "PUBLISHED" },
    ];
    const feedbacks = await Feedback.insertMany(feedbacksData);
    console.log(`   ✓ Inserted ${feedbacks.length} patient testimonials and star ratings.\n`);

    // =========================================================================
    // 9. PRESCRIPTIONS (10 Records)
    // =========================================================================
    console.log("9. Seeding 10 Digital Clinical Prescriptions...");
    await Prescription.deleteMany({});
    const prescriptionsData = [
      {
        prescriptionId: "RX-2026-0001",
        patientId: patients[0]._id,
        patientName: patients[0].name,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        departmentName: departments[0].name,
        diagnosis: "Mild Hypertension & Elevated Lipid Profile",
        clinicalNotes: "Dietary sodium restriction advised. Daily 30 mins brisk walking.",
        vitals: { bp: "138/88 mmHg", pulse: "74 bpm", temp: "98.4°F", weight: "72 kg" },
        medications: [
          { medicineName: "Telmisartan 40mg", dosage: "40mg", frequency: "1-0-0", duration: "30 Days", instructions: "Morning before food" },
          { medicineName: "Atorvastatin 10mg", dosage: "10mg", frequency: "0-0-1", duration: "30 Days", instructions: "Night after food" },
        ],
        followUpDate: "2026-11-15",
      },
      {
        prescriptionId: "RX-2026-0002",
        patientId: patients[1]._id,
        patientName: patients[1].name,
        doctorId: doctors[1]._id,
        doctorName: doctors[1].name,
        departmentName: departments[1].name,
        diagnosis: "Chronic Migraine with Visual Aura",
        clinicalNotes: "Avoid prolonged screen strain without blue filter glasses.",
        vitals: { bp: "120/80 mmHg", pulse: "80 bpm", temp: "98.6°F", weight: "58 kg" },
        medications: [
          { medicineName: "Flunarizine 5mg", dosage: "5mg", frequency: "0-0-1", duration: "15 Days", instructions: "Bedtime with warm water" },
          { medicineName: "Naproxen 500mg", dosage: "500mg", frequency: "1-0-1", duration: "3 Days", instructions: "As needed during severe episodes" },
        ],
        followUpDate: "2026-11-01",
      },
      {
        prescriptionId: "RX-2026-0003",
        patientId: patients[2]._id,
        patientName: patients[2].name,
        doctorId: doctors[2]._id,
        doctorName: doctors[2].name,
        departmentName: departments[2].name,
        diagnosis: "Post-Operative Right Knee Rehab",
        clinicalNotes: "Quadriceps strengthening exercises recommended twice daily.",
        vitals: { bp: "124/82 mmHg", pulse: "72 bpm", temp: "98.2°F", weight: "78 kg" },
        medications: [
          { medicineName: "Glucosamine + Chondroitin", dosage: "500mg", frequency: "1-0-1", duration: "60 Days", instructions: "After food" },
          { medicineName: "Paracetamol 650mg", dosage: "650mg", frequency: "1-0-1", duration: "5 Days", instructions: "For pain management" },
        ],
        followUpDate: "2026-11-20",
      },
      {
        prescriptionId: "RX-2026-0004",
        patientId: patients[3]._id,
        patientName: patients[3].name,
        doctorId: doctors[3]._id,
        doctorName: doctors[3].name,
        departmentName: departments[3].name,
        diagnosis: "Routine Immunization & Mild Teething Fever",
        clinicalNotes: "Keep child well hydrated. Ice compress if injection site swells.",
        vitals: { bp: "95/65 mmHg", pulse: "110 bpm", temp: "99.1°F", weight: "12.5 kg" },
        medications: [
          { medicineName: "Paracetamol Pediatric Drops", dosage: "1.2ml", frequency: "1-1-1", duration: "3 Days", instructions: "Only if temp > 99°F" },
        ],
        followUpDate: "2026-12-15",
      },
      {
        prescriptionId: "RX-2026-0005",
        patientId: patients[4]._id,
        patientName: patients[4].name,
        doctorId: doctors[4]._id,
        doctorName: doctors[4].name,
        departmentName: departments[4].name,
        diagnosis: "Acute Upper Respiratory Tract Viral Infection",
        clinicalNotes: "Steam inhalation twice daily. Salt water gargle.",
        vitals: { bp: "118/76 mmHg", pulse: "86 bpm", temp: "100.4°F", weight: "66 kg" },
        medications: [
          { medicineName: "Paracetamol 650mg", dosage: "650mg", frequency: "1-1-1", duration: "5 Days", instructions: "After food" },
          { medicineName: "Levocetirizine 5mg", dosage: "5mg", frequency: "0-0-1", duration: "5 Days", instructions: "Night time" },
          { medicineName: "Vitamin C 500mg Chewable", dosage: "500mg", frequency: "1-0-0", duration: "10 Days", instructions: "After breakfast" },
        ],
        followUpDate: "2026-10-22",
      },
      {
        prescriptionId: "RX-2026-0006",
        patientId: patients[5]._id,
        patientName: patients[5].name,
        doctorId: doctors[5]._id,
        doctorName: doctors[5].name,
        departmentName: departments[5].name,
        diagnosis: "Allergic Contact Dermatitis",
        clinicalNotes: "Use mild fragrance-free soap. Avoid direct synthetic detergent exposure.",
        vitals: { bp: "122/80 mmHg", pulse: "76 bpm", temp: "98.4°F", weight: "60 kg" },
        medications: [
          { medicineName: "Hydrocortisone 1% Cream", dosage: "Topical", frequency: "1-0-1", duration: "7 Days", instructions: "Apply thin film on affected skin" },
          { medicineName: "Fexofenadine 120mg", dosage: "120mg", frequency: "1-0-0", duration: "10 Days", instructions: "Morning with water" },
        ],
        followUpDate: "2026-11-05",
      },
      {
        prescriptionId: "RX-2026-0007",
        patientId: patients[6]._id,
        patientName: patients[6].name,
        doctorId: doctors[6]._id,
        doctorName: doctors[6].name,
        departmentName: departments[6].name,
        diagnosis: "Computer Vision Syndrome & Dry Eye",
        clinicalNotes: "Practice 20-20-20 rule during screen usage.",
        vitals: { bp: "126/84 mmHg", pulse: "70 bpm", temp: "98.4°F", weight: "74 kg" },
        medications: [
          { medicineName: "Carboxymethylcellulose 0.5% Eye Drops", dosage: "1 drop", frequency: "1-1-1-1", duration: "30 Days", instructions: "Both eyes 4 times daily" },
        ],
        followUpDate: "2026-11-25",
      },
      {
        prescriptionId: "RX-2026-0008",
        patientId: patients[7]._id,
        patientName: patients[7].name,
        doctorId: doctors[7]._id,
        doctorName: doctors[7].name,
        departmentName: departments[7].name,
        diagnosis: "Chronic Allergic Sinusitis with Hypertrophied Turbinates",
        clinicalNotes: "Avoid sudden cold air exposure and dusting without mask.",
        vitals: { bp: "130/85 mmHg", pulse: "78 bpm", temp: "98.6°F", weight: "70 kg" },
        medications: [
          { medicineName: "Fluticasone Nasal Spray", dosage: "1 spray", frequency: "1-0-1", duration: "21 Days", instructions: "Each nostril twice daily" },
          { medicineName: "Montelukast 10mg", dosage: "10mg", frequency: "0-0-1", duration: "14 Days", instructions: "Bedtime" },
        ],
        followUpDate: "2026-11-10",
      },
      {
        prescriptionId: "RX-2026-0009",
        patientId: patients[8]._id,
        patientName: patients[8].name,
        doctorId: doctors[8]._id,
        doctorName: doctors[8].name,
        departmentName: departments[8].name,
        diagnosis: "Normal Gestation - 22 Weeks (Second Trimester)",
        clinicalNotes: "Fetal heart rate: 144 bpm. Growth parameters adequate.",
        vitals: { bp: "114/74 mmHg", pulse: "82 bpm", temp: "98.4°F", weight: "64 kg" },
        medications: [
          { medicineName: "Ferrous Ascorbate + Folic Acid", dosage: "1 tab", frequency: "0-1-0", duration: "60 Days", instructions: "After lunch" },
          { medicineName: "Calcium Carbonate + Vit D3", dosage: "500mg", frequency: "1-0-0", duration: "60 Days", instructions: "After breakfast" },
        ],
        followUpDate: "2026-11-18",
      },
      {
        prescriptionId: "RX-2026-0010",
        patientId: patients[9]._id,
        patientName: patients[9].name,
        doctorId: doctors[9]._id,
        doctorName: doctors[9].name,
        departmentName: departments[9].name,
        diagnosis: "Post-Chemotherapy Surveillance & Nutritional Support",
        clinicalNotes: "CBC and liver enzyme panel within normal limits.",
        vitals: { bp: "120/78 mmHg", pulse: "75 bpm", temp: "98.5°F", weight: "62 kg" },
        medications: [
          { medicineName: "Multivitamin + Amino Acid Supplement", dosage: "1 tab", frequency: "1-0-0", duration: "30 Days", instructions: "Morning after meal" },
          { medicineName: "Ondansetron 4mg", dosage: "4mg", frequency: "1-0-1", duration: "3 Days", instructions: "Only if nausea occurs" },
        ],
        followUpDate: "2026-11-30",
      },
    ];
    const prescriptions = await Prescription.insertMany(prescriptionsData);
    console.log(`   ✓ Inserted ${prescriptions.length} digital prescriptions.\n`);

    console.log("=====================================================================");
    console.log("  🎉 SUCCESS: All 9 Modules Populated with 10 Real Records Each!     ");
    console.log("=====================================================================");
    console.log("• Departments:      10 Records");
    console.log("• Doctors:          10 Records");
    console.log("• Patients:         10 Records");
    console.log("• Appointments:     10 Records");
    console.log("• Queue Tokens:     10 Records (A-01 to A-10)");
    console.log("• Invoices & Bills: 10 Records (INV-2026-0001 to 0010)");
    console.log("• Doctor Schedules: 10 Records");
    console.log("• Feedback/Reviews: 10 Records");
    console.log("• Prescriptions:    10 Records");
    console.log("=====================================================================");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    console.log("Database connection closed.");
  }
}

seed();
