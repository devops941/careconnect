import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";
import { Department } from "../src/models/Department";
import { Doctor } from "../src/models/Doctor";
import { Employee } from "../src/models/Employee";
import { Patient } from "../src/models/Patient";
import { HospitalSetting } from "../src/models/HospitalSetting";
import { bootstrapSuperAdmin } from "../src/server/bootstrap/super-admin.bootstrap";
import { passwordService } from "../src/server/services/password.service";
import { AUTH_PROVIDERS, ACCOUNT_STATUS } from "../src/lib/constants";

async function run() {
  console.log("=====================================================================");
  console.log("  🏥 CareConnect - 5 Departments & 5 Staff/Doctors Seeder           ");
  console.log("=====================================================================\n");

  try {
    await connectToDatabase();
    console.log("1. Connected to MongoDB successfully.\n");

    // Ensure Super Admin exists
    console.log("2. Verifying Super Admin...");
    await bootstrapSuperAdmin();
    console.log("   ✓ Super Admin verified (admin@gmail.com)\n");

    // =========================================================================
    // 1. DEPARTMENTS (Exactly 5 records)
    // =========================================================================
    console.log("3. Seeding 5 Clinical Departments...");
    await Department.deleteMany({});
    const departmentsData = [
      {
        deptId: "CARD",
        name: "Cardiology",
        description: "Comprehensive cardiac, vascular, and interventional coronary care",
        headDoctorName: "Dr. Sarah Jenkins",
        opdRoomNo: "Room 201",
        status: "ACTIVE" as const,
      },
      {
        deptId: "NEUR",
        name: "Neurology",
        description: "Brain, spine, stroke, neurological diagnostics and therapy",
        headDoctorName: "Dr. Rajesh Sundaram",
        opdRoomNo: "Room 302",
        status: "ACTIVE" as const,
      },
      {
        deptId: "ORTH",
        name: "Orthopedics",
        description: "Joint reconstruction, trauma fracture, sports medicine & spine care",
        headDoctorName: "Dr. Vikram Sethi",
        opdRoomNo: "Room 105",
        status: "ACTIVE" as const,
      },
      {
        deptId: "PEDI",
        name: "Pediatrics",
        description: "Neonatal care, immunization, and child development medicine",
        headDoctorName: "Dr. Ananya Natarajan",
        opdRoomNo: "Room 102",
        status: "ACTIVE" as const,
      },
      {
        deptId: "GMED",
        name: "General Medicine",
        description: "Adult internal medicine, metabolic disorders, fever & preventive wellness",
        headDoctorName: "Dr. Arvind Swaminathan",
        opdRoomNo: "Room 101",
        status: "ACTIVE" as const,
      },
    ];

    const departments = await Department.insertMany(departmentsData);
    console.log(`   ✓ Inserted ${departments.length} departments:`);
    departments.forEach((d, i) => console.log(`     ${i + 1}. [${d.deptId}] ${d.name} (${d.opdRoomNo})`));

    // =========================================================================
    // 2. DOCTORS (Exactly 5 Specialist Doctors)
    // =========================================================================
    console.log("\n4. Seeding 5 Specialist Doctors...");
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
        status: "ACTIVE" as const,
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
        status: "ACTIVE" as const,
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
        status: "ACTIVE" as const,
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
        status: "ACTIVE" as const,
      },
      {
        doctorId: "DOC-2026-005",
        name: "Dr. Arvind Swaminathan",
        email: "arvind.swaminathan@careconnect.health",
        phone: "+91 98405 67894",
        specialization: "Chief Consultant Physician",
        departmentId: departments[4]._id,
        departmentName: departments[4].name,
        qualification: "MBBS, MD (General Medicine), FRCP",
        experienceYears: 16,
        consultationFee: 600,
        opdRoomNo: "Room 101",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: ["09:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
        status: "ACTIVE" as const,
      },
    ];

    const doctors = await Doctor.insertMany(doctorsData);
    console.log(`   ✓ Inserted ${doctors.length} doctors:`);
    doctors.forEach((doc, i) => console.log(`     ${i + 1}. ${doc.name} (${doc.specialization} - ${doc.departmentName})`));

    // =========================================================================
    // 3. STAFF & EMPLOYEE ACCOUNTS (5 Non-Doctor Staff + 5 Doctor Logins)
    // =========================================================================
    console.log("\n5. Seeding Hospital Employees (5 Staff + 5 Doctor accounts)...");
    await Employee.deleteMany({});
    const defaultPasswordHash = await passwordService.hashPassword("Password123!");

    const employeesData = [
      // 5 Non-Doctor Hospital Staff:
      {
        employeeId: "EMP-ADM-01",
        name: "Suresh Krishnan",
        email: "suresh.admin@careconnect.health",
        normalizedEmail: "suresh.admin@careconnect.health",
        passwordHash: defaultPasswordHash,
        role: "ADMIN" as const,
        department: "Administration",
        phone: "+91 98400 11111",
        status: "ACTIVE" as const,
      },
      {
        employeeId: "EMP-ADM-02",
        name: "Priya Ramanathan",
        email: "priya.ops@careconnect.health",
        normalizedEmail: "priya.ops@careconnect.health",
        passwordHash: defaultPasswordHash,
        role: "ADMIN" as const,
        department: "Operations",
        phone: "+91 98400 22222",
        status: "ACTIVE" as const,
      },
      {
        employeeId: "EMP-REC-01",
        name: "Kavitha Murugan",
        email: "kavitha.reception@careconnect.health",
        normalizedEmail: "kavitha.reception@careconnect.health",
        passwordHash: defaultPasswordHash,
        role: "RECEPTIONIST" as const,
        department: "Front Desk",
        phone: "+91 98400 33333",
        status: "ACTIVE" as const,
      },
      {
        employeeId: "EMP-REC-02",
        name: "Vignesh Balaji",
        email: "vignesh.triage@careconnect.health",
        normalizedEmail: "vignesh.triage@careconnect.health",
        passwordHash: defaultPasswordHash,
        role: "RECEPTIONIST" as const,
        department: "Emergency Desk",
        phone: "+91 98400 44444",
        status: "ACTIVE" as const,
      },
      {
        employeeId: "EMP-REC-03",
        name: "Deepa Senthil",
        email: "deepa.billing@careconnect.health",
        normalizedEmail: "deepa.billing@careconnect.health",
        passwordHash: defaultPasswordHash,
        role: "RECEPTIONIST" as const,
        department: "Billing & Cashier",
        phone: "+91 98400 55555",
        status: "ACTIVE" as const,
      },
      // 5 Doctor Employee Login Records (Linked by email & doctorId):
      ...doctorsData.map((d) => ({
        employeeId: d.doctorId,
        name: d.name,
        email: d.email,
        normalizedEmail: d.email.toLowerCase(),
        passwordHash: defaultPasswordHash,
        role: "DOCTOR" as const,
        department: d.departmentName,
        phone: d.phone,
        status: "ACTIVE" as const,
      })),
    ];

    const employees = await Employee.insertMany(employeesData);
    console.log(`   ✓ Inserted ${employees.length} employee accounts in total (5 Staff + 5 Doctors).`);

    // =========================================================================
    // 4. UPDATE HOSPITAL SETTING DEPARTMENTS
    // =========================================================================
    console.log("\n6. Updating Hospital Profile Settings...");
    await HospitalSetting.findOneAndUpdate(
      {},
      {
        hospitalName: "CareConnect Health Systems",
        tagline: "Clinical Queue Coordination & Healthcare Appointments",
        departments: departmentsData.map((d) => d.name),
        onboardingCompleted: true,
      },
      { upsert: true, new: true }
    );
    // =========================================================================
    // 5. PATIENTS (Exactly 5 Registered Patients)
    // =========================================================================
    console.log("7. Seeding 5 Registered Patients...");
    await Patient.deleteMany({});
    const patientPasswordHash = await passwordService.hashPassword("Password123!");
    const patientsData = [
      {
        name: "Arunachalam Pillai",
        email: "arunachalam@example.com",
        normalizedEmail: "arunachalam@example.com",
        phone: "+91 98403 55667",
        bloodGroup: "A+" as const,
        gender: "MALE" as const,
        dateOfBirth: new Date("1976-11-03"),
        passwordHash: patientPasswordHash,
        authProviders: [AUTH_PROVIDERS.CREDENTIALS],
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      {
        name: "Sneha Sundar",
        email: "sneha.sundar@example.com",
        normalizedEmail: "sneha.sundar@example.com",
        phone: "+91 98402 33445",
        bloodGroup: "O+" as const,
        gender: "FEMALE" as const,
        dateOfBirth: new Date("1994-09-21"),
        passwordHash: patientPasswordHash,
        authProviders: [AUTH_PROVIDERS.CREDENTIALS],
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      {
        name: "Ramesh Kumar",
        email: "ramesh.kumar@example.com",
        normalizedEmail: "ramesh.kumar@example.com",
        phone: "+91 98401 11222",
        bloodGroup: "B+" as const,
        gender: "MALE" as const,
        dateOfBirth: new Date("1988-05-14"),
        passwordHash: patientPasswordHash,
        authProviders: [AUTH_PROVIDERS.CREDENTIALS],
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      {
        name: "Meenakshi Venkat",
        email: "meenakshi.v@example.com",
        normalizedEmail: "meenakshi.v@example.com",
        phone: "+91 98404 77889",
        bloodGroup: "AB+" as const,
        gender: "FEMALE" as const,
        dateOfBirth: new Date("1985-03-19"),
        passwordHash: patientPasswordHash,
        authProviders: [AUTH_PROVIDERS.CREDENTIALS],
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      {
        name: "Karthik Subramaniam",
        email: "karthik.subbu@example.com",
        normalizedEmail: "karthik.subbu@example.com",
        phone: "+91 98405 99001",
        bloodGroup: "O-" as const,
        gender: "MALE" as const,
        dateOfBirth: new Date("2001-12-08"),
        passwordHash: patientPasswordHash,
        authProviders: [AUTH_PROVIDERS.CREDENTIALS],
        status: ACCOUNT_STATUS.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    ];

    const patients = await Patient.insertMany(patientsData);
    console.log(`   ✓ Inserted ${patients.length} registered patients.\n`);

    console.log("=====================================================================");
    console.log("  🎉 SUCCESS: 5 Departments, 5 Doctors, 5 Staff & 5 Patients Seeded!  ");
    console.log("=====================================================================");
    console.log("\n📋 Summary:");
    console.log("• Departments:  5 Active (Cardiology, Neurology, Orthopedics, Pediatrics, General Medicine)");
    console.log("• Doctors:      5 Active Specialists");
    console.log("• Staff:        5 Non-Doctor Personnel (2 Admins, 3 Receptionists)");
    console.log("• Patients:     5 Registered Patients (A+, O+, B+, AB+, O-)");
    console.log("• Super Admin:  admin@gmail.com / Admin@123 (Active & Unchanged)");
    console.log("• Appointments/Tokens/Bills: 0 (Completely clean)\n");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    console.log("Database connection closed.");
  }
}

run();
