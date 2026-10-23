import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";
import { bootstrapSuperAdmin } from "../src/server/bootstrap/super-admin.bootstrap";
import { Hospital } from "../src/models/Hospital";
import { Department } from "../src/models/Department";
import { Doctor } from "../src/models/Doctor";
import { Employee } from "../src/models/Employee";
import { User } from "../src/models/User";
import { Patient } from "../src/models/Patient";
import { QueueToken } from "../src/models/QueueToken";
import { Appointment } from "../src/models/Appointment";
import { HospitalSetting } from "../src/models/HospitalSetting";
import { passwordService } from "../src/server/services/password.service";
import { normalizeEmail } from "../src/lib/utils";

export async function clearAndSeedDatabase() {
  console.log("=====================================================================");
  console.log("    🏥 CareConnect - Complete Database Reset & Enterprise Seeding   ");
  console.log("=====================================================================\n");

  try {
    await connectToDatabase();
    console.log("1. Connected to MongoDB database.");

    // STEP 1: Clear All Collections
    console.log("\n2. Emptying all existing database collections...");
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.collections();
      for (const col of collections) {
        await col.deleteMany({});
        console.log(`   ✓ Emptied collection: ${col.collectionName}`);
      }
    }
    console.log("   ✅ All existing data cleared successfully.\n");

    // STEP 2: Bootstrap Super Admin
    console.log("3. Bootstrapping Super Admin account...");
    const superAdminResult = await bootstrapSuperAdmin();
    console.log(`   ✓ Super Admin: ${superAdminResult.status} (${superAdminResult.message})`);

    const superAdmin = await User.findOne({ role: "SUPER_ADMIN" as any }).exec();
    const superAdminId = superAdmin ? (superAdmin as any)._id.toString() : new mongoose.Types.ObjectId().toString();

    // Default password for all staff and patients
    const defaultPassword = "Password123!";
    const passwordHash = await passwordService.hashPassword(defaultPassword);

    // STEP 3: Seed 2 Hospitals
    console.log("\n4. Seeding 2 Hospitals...");
    const hospitalsData = [
      {
        hospitalId: "HOSP-01",
        name: "CareConnect City Hospital",
        code: "CC-CITY",
        type: "MAIN_FACILITY" as const,
        tagline: "Premier Multi-Speciality Outpatient & Tertiary Healthcare Center",
        licenseNumber: "HOSP-TN-2026-001",
        emergencyPhone: "+91 44 2836 5500",
        contactEmail: "care@careconnect-city.health",
        address: {
          street: "142 Anna Salai, Mount Road",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600002",
          country: "India",
        },
        emergency24x7: true,
        status: "ACTIVE" as const,
      },
      {
        hospitalId: "HOSP-02",
        name: "CareConnect Metro Health Center",
        code: "CC-METRO",
        type: "SATELLITE_CLINIC" as const,
        tagline: "Specialized Orthopedics, Cardiac Care & 24/7 Emergency Triage",
        licenseNumber: "HOSP-TN-2026-002",
        emergencyPhone: "+91 422 4920 800",
        contactEmail: "emergency@careconnect-metro.health",
        address: {
          street: "88 Avinashi Road, Peelamedu",
          city: "Coimbatore",
          state: "Tamil Nadu",
          postalCode: "641004",
          country: "India",
        },
        emergency24x7: true,
        status: "ACTIVE" as const,
      },
    ];

    const seededHospitals: any[] = [];
    for (const hData of hospitalsData) {
      const h = await Hospital.create(hData);
      seededHospitals.push(h);
      console.log(`   ✓ Created Hospital: ${h.name} (${h.code})`);
    }

    const hospital1 = seededHospitals[0];
    const hospital2 = seededHospitals[1];

    // STEP 4: Seed Clinical Departments
    console.log("\n5. Seeding Clinical Departments...");
    const deptsData = [
      {
        deptId: "GMED",
        name: "General Medicine",
        description: "Primary adult consultation, preventive health, and internal medicine.",
        opdRoomNo: "Room 101",
        headDoctorName: "Dr. Gokul R",
        status: "ACTIVE" as const,
      },
      {
        deptId: "CARD",
        name: "Cardiology",
        description: "Comprehensive cardiac diagnostics, ECG, hypertension & heart care.",
        opdRoomNo: "Room 102",
        headDoctorName: "Dr. Priya Annamalai",
        status: "ACTIVE" as const,
      },
      {
        deptId: "PEDI",
        name: "Pediatrics & Child Health",
        description: "Neonatal care, pediatric immunization, and infant development.",
        opdRoomNo: "Room 103",
        headDoctorName: "Dr. Rajesh Kumar",
        status: "ACTIVE" as const,
      },
      {
        deptId: "ORTHO",
        name: "Orthopedics & Joint Care",
        description: "Bone trauma, fracture management, arthritis and joint therapies.",
        opdRoomNo: "Room 201",
        headDoctorName: "Dr. Suresh Verma",
        status: "ACTIVE" as const,
      },
    ];

    const seededDepts: any[] = [];
    for (const dData of deptsData) {
      const dept = await Department.create(dData);
      seededDepts.push(dept);
      console.log(`   ✓ Created Department: ${dept.name} (${dept.deptId})`);
    }

    const deptGmed = seededDepts[0];
    const deptCard = seededDepts[1];
    const deptPedi = seededDepts[2];
    const deptOrtho = seededDepts[3];

    // Initialize Hospital Settings (so super admin does not get stuck in onboarding)
    await HospitalSetting.findOneAndUpdate(
      {},
      {
        hospitalName: hospital1.name,
        tagline: hospital1.tagline,
        contactEmail: hospital1.contactEmail,
        emergencyPhone: hospital1.emergencyPhone,
        licenseNumber: hospital1.licenseNumber,
        address: hospital1.address,
        departments: seededDepts.map((d) => d.name),
        emergency24x7: true,
        onboardingCompleted: true,
        setupCompletedBy: superAdminId,
      },
      { upsert: true, new: true }
    );
    console.log("   ✓ Initialized Hospital Settings with onboardingCompleted = true");

    // Standard Shift Timings
    const commonAvailableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const commonShiftHours = {
      morningSlot: "09:00 AM - 01:00 PM",
      eveningSlot: "05:00 PM - 08:30 PM",
    };
    const commonTimeSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"
    ];

    // STEP 5: Seed Doctors (3 for Hospital 1, 3 for Hospital 2)
    console.log("\n6. Seeding Doctors (3 for Hospital 1, 3 for Hospital 2)...");
    const doctorsData = [
      // Hospital 1 Doctors
      {
        doctorId: "DOC-101",
        name: "Dr. Gokul R",
        email: "gokul@gmail.com",
        phone: "+91 98401 11001",
        specialization: "General Physician & Internal Medicine",
        qualification: "MBBS, MD (General Medicine)",
        experienceYears: 10,
        consultationFee: 400,
        opdRoomNo: "Room 101",
        medicalCouncilRegNo: "MCI-TN-55201",
        departmentId: deptGmed._id,
        departmentName: deptGmed.name,
        hospitalId: hospital1._id,
        hospitalName: hospital1.name,
        gender: "MALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
      {
        doctorId: "DOC-102",
        name: "Dr. Priya Annamalai",
        email: "priya@gmail.com",
        phone: "+91 98401 11002",
        specialization: "Interventional Cardiologist",
        qualification: "MBBS, MD, DM (Cardiology)",
        experienceYears: 14,
        consultationFee: 700,
        opdRoomNo: "Room 102",
        medicalCouncilRegNo: "MCI-TN-48392",
        departmentId: deptCard._id,
        departmentName: deptCard.name,
        hospitalId: hospital1._id,
        hospitalName: hospital1.name,
        gender: "FEMALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
      {
        doctorId: "DOC-103",
        name: "Dr. Rajesh Kumar",
        email: "rajesh@gmail.com",
        phone: "+91 98401 11003",
        specialization: "Pediatrician & Child Health Specialist",
        qualification: "MBBS, DCH, MD (Pediatrics)",
        experienceYears: 12,
        consultationFee: 500,
        opdRoomNo: "Room 103",
        medicalCouncilRegNo: "MCI-TN-61904",
        departmentId: deptPedi._id,
        departmentName: deptPedi.name,
        hospitalId: hospital1._id,
        hospitalName: hospital1.name,
        gender: "MALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
      // Hospital 2 Doctors
      {
        doctorId: "DOC-201",
        name: "Dr. Suresh Verma",
        email: "suresh@gmail.com",
        phone: "+91 98402 22001",
        specialization: "Senior Orthopedic & Joint Surgeon",
        qualification: "MBBS, MS (Orthopedics), DNB",
        experienceYears: 16,
        consultationFee: 650,
        opdRoomNo: "Room 201",
        medicalCouncilRegNo: "MCI-TN-39108",
        departmentId: deptOrtho._id,
        departmentName: deptOrtho.name,
        hospitalId: hospital2._id,
        hospitalName: hospital2.name,
        gender: "MALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
      {
        doctorId: "DOC-202",
        name: "Dr. Meena Krishnan",
        email: "meena@gmail.com",
        phone: "+91 98402 22002",
        specialization: "Clinical Cardiologist & Echocardiography",
        qualification: "MBBS, MD, DNB (Cardiology)",
        experienceYears: 11,
        consultationFee: 600,
        opdRoomNo: "Room 202",
        medicalCouncilRegNo: "MCI-TN-54219",
        departmentId: deptCard._id,
        departmentName: deptCard.name,
        hospitalId: hospital2._id,
        hospitalName: hospital2.name,
        gender: "FEMALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
      {
        doctorId: "DOC-203",
        name: "Dr. Arun Prakash",
        email: "arun@gmail.com",
        phone: "+91 98402 22003",
        specialization: "General Physician & Diabetologist",
        qualification: "MBBS, MD (Internal Medicine)",
        experienceYears: 9,
        consultationFee: 450,
        opdRoomNo: "Room 203",
        medicalCouncilRegNo: "MCI-TN-72810",
        departmentId: deptGmed._id,
        departmentName: deptGmed.name,
        hospitalId: hospital2._id,
        hospitalName: hospital2.name,
        gender: "MALE" as const,
        availableDays: commonAvailableDays,
        shiftHours: commonShiftHours,
        timeSlots: commonTimeSlots,
        status: "ACTIVE" as const,
      },
    ];

    const seededDoctors: any[] = [];
    for (const docData of doctorsData) {
      const normalized = normalizeEmail(docData.email);

      // Create in User collection
      await User.create({
        name: docData.name,
        email: docData.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "DOCTOR",
        status: "ACTIVE",
        authProviders: ["credentials"],
        emailVerifiedAt: new Date(),
      });

      // Create in Employee collection (enables login via Employee ID or email)
      await Employee.create({
        employeeId: docData.doctorId,
        name: docData.name,
        email: docData.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "DOCTOR",
        department: docData.departmentName,
        phone: docData.phone,
        status: "ACTIVE",
        createdBy: superAdminId,
      });

      // Create in Doctor collection
      const doctorDoc = await Doctor.create(docData);
      seededDoctors.push(doctorDoc);
      console.log(`   ✓ Created Doctor: ${docData.name} (${docData.email} | ${docData.doctorId}) - ${docData.hospitalName}`);
    }

    // STEP 6: Seed Nurses (2 for Hospital 1, 2 for Hospital 2)
    console.log("\n7. Seeding Nurses (2 for Hospital 1, 2 for Hospital 2)...");
    const nursesData = [
      // Hospital 1 Nurses
      {
        employeeId: "NUR-101",
        name: "Sister Anitha V, RN",
        email: "anitha@gmail.com",
        phone: "+91 97911 11001",
        role: "NURSE" as const,
        department: "OPD Triage / Vitals Station",
        hospitalName: hospital1.name,
      },
      {
        employeeId: "NUR-102",
        name: "Sister Deepa M, RN",
        email: "deepa@gmail.com",
        phone: "+91 97911 11002",
        role: "NURSE" as const,
        department: "Emergency & Vitals Intake",
        hospitalName: hospital1.name,
      },
      // Hospital 2 Nurses
      {
        employeeId: "NUR-201",
        name: "Sister Saranya T, RN",
        email: "saranya@gmail.com",
        phone: "+91 97912 22001",
        role: "NURSE" as const,
        department: "General Ward & Triage",
        hospitalName: hospital2.name,
      },
      {
        employeeId: "NUR-202",
        name: "Sister Kavya R, RN",
        email: "kavya@gmail.com",
        phone: "+91 97912 22002",
        role: "NURSE" as const,
        department: "OPD Triage Station 2",
        hospitalName: hospital2.name,
      },
    ];

    const seededNurses: any[] = [];
    for (const nurse of nursesData) {
      const normalized = normalizeEmail(nurse.email);

      // Create in User collection
      await User.create({
        name: nurse.name,
        email: nurse.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "NURSE",
        status: "ACTIVE",
        authProviders: ["credentials"],
        emailVerifiedAt: new Date(),
      });

      // Create in Employee collection
      const nurseEmp = await Employee.create({
        employeeId: nurse.employeeId,
        name: nurse.name,
        email: nurse.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "NURSE",
        department: nurse.department,
        phone: nurse.phone,
        status: "ACTIVE",
        createdBy: superAdminId,
      });
      seededNurses.push(nurseEmp);
      console.log(`   ✓ Created Nurse: ${nurse.name} (${nurse.email} | ${nurse.employeeId}) - ${nurse.hospitalName}`);
    }

    // STEP 7: Seed Receptionists (1 for Hospital 1, 1 for Hospital 2)
    console.log("\n8. Seeding Receptionists (1 for Hospital 1, 1 for Hospital 2)...");
    const receptionistsData = [
      {
        employeeId: "REC-101",
        name: "Ramesh Kannan",
        email: "ramesh@gmail.com",
        phone: "+91 98403 11001",
        role: "RECEPTIONIST" as const,
        department: "Central Registration & Front Desk",
        hospitalName: hospital1.name,
      },
      {
        employeeId: "REC-201",
        name: "Karthik Pandian",
        email: "karthik@gmail.com",
        phone: "+91 98403 22001",
        role: "RECEPTIONIST" as const,
        department: "Front Desk & Patient Services",
        hospitalName: hospital2.name,
      },
    ];

    const seededReceptionists: any[] = [];
    for (const rec of receptionistsData) {
      const normalized = normalizeEmail(rec.email);

      // Create in User collection
      await User.create({
        name: rec.name,
        email: rec.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "RECEPTIONIST",
        status: "ACTIVE",
        authProviders: ["credentials"],
        emailVerifiedAt: new Date(),
      });

      // Create in Employee collection
      const recEmp = await Employee.create({
        employeeId: rec.employeeId,
        name: rec.name,
        email: rec.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "RECEPTIONIST",
        department: rec.department,
        phone: rec.phone,
        status: "ACTIVE",
        createdBy: superAdminId,
      });
      seededReceptionists.push(recEmp);
      console.log(`   ✓ Created Receptionist: ${rec.name} (${rec.email} | ${rec.employeeId}) - ${rec.hospitalName}`);
    }

    // STEP 8: Seed 5 Patients
    console.log("\n9. Seeding 5 Patients...");
    const patientsData = [
      {
        name: "Murugan Swaminathan",
        email: "murugan@gmail.com",
        phone: "+91 94441 10001",
        gender: "MALE" as const,
        bloodGroup: "B+",
        age: 48,
      },
      {
        name: "Kavitha Rajendran",
        email: "kavitha@gmail.com",
        phone: "+91 94441 10002",
        gender: "FEMALE" as const,
        bloodGroup: "O+",
        age: 35,
      },
      {
        name: "Vignesh Manoharan",
        email: "vignesh@gmail.com",
        phone: "+91 94441 10003",
        gender: "MALE" as const,
        bloodGroup: "A+",
        age: 28,
      },
      {
        name: "Divya Sundaram",
        email: "divya@gmail.com",
        phone: "+91 94441 10004",
        gender: "FEMALE" as const,
        bloodGroup: "AB+",
        age: 24,
      },
      {
        name: "Selvam Palanisamy",
        email: "selvam@gmail.com",
        phone: "+91 94441 10005",
        gender: "MALE" as const,
        bloodGroup: "O-",
        age: 56,
      },
    ];

    const seededPatients: any[] = [];
    const seededPatientUsers: any[] = [];
    for (const pData of patientsData) {
      const normalized = normalizeEmail(pData.email);

      // Create in User collection
      const pUser = await User.create({
        name: pData.name,
        email: pData.email,
        normalizedEmail: normalized,
        passwordHash,
        role: "PATIENT",
        status: "ACTIVE",
        authProviders: ["credentials"],
        emailVerifiedAt: new Date(),
      });
      seededPatientUsers.push(pUser);

      // Create in Patient collection
      const patientDoc = await Patient.create({
        name: pData.name,
        email: pData.email,
        normalizedEmail: normalized,
        phone: pData.phone,
        gender: pData.gender,
        bloodGroup: pData.bloodGroup,
        status: "ACTIVE",
        passwordHash,
        emailVerifiedAt: new Date(),
      });
      seededPatients.push(patientDoc);
      console.log(`   ✓ Created Patient: ${pData.name} (${pData.email})`);
    }

    // STEP 9: Seed Appointments & Live OPD Queue Tokens
    console.log("\n10. Seeding Live OPD Queue Tokens & Appointments for Today...");
    const today = new Date().toISOString().split("T")[0];

    // Token 1: Patient Murugan visiting Dr. Gokul (Hospital 1, GMED)
    // Status: WAITING, Vitals: PENDING -> Perfect for Nurse to test entering vitals!
    await QueueToken.create({
      tokenNumber: "GMED-101",
      tokenSequence: 101,
      tokenDate: today,
      patientName: seededPatients[0].name,
      patientPhone: seededPatients[0].phone,
      patientId: seededPatients[0]._id,
      doctorId: seededDoctors[0]._id,
      doctorName: seededDoctors[0].name,
      departmentId: deptGmed._id,
      departmentName: deptGmed.name,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      opdRoomNo: "Room 101",
      priority: "NORMAL",
      status: "WAITING",
      vitalsStatus: "PENDING",
    });

    await Appointment.create({
      appointmentId: "APT-2026-101",
      patientId: seededPatients[0]._id,
      patientName: seededPatients[0].name,
      patientPhone: seededPatients[0].phone,
      patientEmail: seededPatients[0].email,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      doctorId: seededDoctors[0]._id,
      doctorName: seededDoctors[0].name,
      departmentId: deptGmed._id,
      departmentName: deptGmed.name,
      appointmentDate: today,
      timeSlot: "09:30 AM",
      type: "IN_PERSON",
      status: "CHECKED_IN",
      tokenNumber: "GMED-101",
      notes: "Severe persistent headaches and seasonal flu symptoms.",
    });
    console.log(`   ✓ Token 1: GMED-101 (${seededPatients[0].name} -> ${seededDoctors[0].name}) -> Vitals: PENDING (Nurse Testing)`);

    // Token 2: Patient Kavitha visiting Dr. Priya (Hospital 1, CARD)
    // Status: CALLED, Vitals: RECORDED -> Perfect for Doctor to test Consultation!
    await QueueToken.create({
      tokenNumber: "CARD-102",
      tokenSequence: 102,
      tokenDate: today,
      patientName: seededPatients[1].name,
      patientPhone: seededPatients[1].phone,
      patientId: seededPatients[1]._id,
      doctorId: seededDoctors[1]._id,
      doctorName: seededDoctors[1].name,
      departmentId: deptCard._id,
      departmentName: deptCard.name,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      opdRoomNo: "Room 102",
      priority: "NORMAL",
      status: "CALLED",
      vitalsStatus: "RECORDED",
      vitals: {
        heightCm: 162,
        weightKg: 64,
        bmi: 24.4,
        bmiCategory: "Normal",
        bpSystolic: 135,
        bpDiastolic: 88,
        bpFormatted: "135/88 mmHg",
        pulseBpm: 82,
        tempFahrenheit: 98.4,
        spo2Percent: 99,
        respiratoryRate: 18,
        rbsMgDl: 110,
        allergies: "Penicillin & Sulfa Antibiotics",
        chiefComplaints: "Palpitations during light exertion, chest tightness for past 3 days.",
        nurseNotes: "Patient conscious, stable. ECG advised by cardiology protocol.",
        recordedByNurseId: seededNurses[0]._id,
        recordedByNurseName: seededNurses[0].name,
        recordedAt: new Date(),
      },
    });

    await Appointment.create({
      appointmentId: "APT-2026-102",
      patientId: seededPatients[1]._id,
      patientName: seededPatients[1].name,
      patientPhone: seededPatients[1].phone,
      patientEmail: seededPatients[1].email,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      doctorId: seededDoctors[1]._id,
      doctorName: seededDoctors[1].name,
      departmentId: deptCard._id,
      departmentName: deptCard.name,
      appointmentDate: today,
      timeSlot: "10:00 AM",
      type: "IN_PERSON",
      status: "IN_CONSULTATION",
      tokenNumber: "CARD-102",
      notes: "Cardiology routine review and hypertension follow-up.",
    });
    console.log(`   ✓ Token 2: CARD-102 (${seededPatients[1].name} -> ${seededDoctors[1].name}) -> Vitals: RECORDED (Doctor Testing)`);

    // Token 3: Patient Vignesh visiting Dr. Rajesh (Hospital 1, PEDI)
    await QueueToken.create({
      tokenNumber: "PEDI-103",
      tokenSequence: 103,
      tokenDate: today,
      patientName: seededPatients[2].name,
      patientPhone: seededPatients[2].phone,
      patientId: seededPatients[2]._id,
      doctorId: seededDoctors[2]._id,
      doctorName: seededDoctors[2].name,
      departmentId: deptPedi._id,
      departmentName: deptPedi.name,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      opdRoomNo: "Room 103",
      priority: "NORMAL",
      status: "WAITING",
      vitalsStatus: "RECORDED",
      vitals: {
        heightCm: 172,
        weightKg: 68,
        bmi: 23.0,
        bmiCategory: "Normal",
        bpSystolic: 120,
        bpDiastolic: 80,
        bpFormatted: "120/80 mmHg",
        pulseBpm: 76,
        tempFahrenheit: 99.2,
        spo2Percent: 98,
        respiratoryRate: 16,
        rbsMgDl: 95,
        allergies: "None",
        chiefComplaints: "Mild fever and throat irritation.",
        nurseNotes: "Temperature slightly elevated. General hydration advised.",
        recordedByNurseId: seededNurses[1]._id,
        recordedByNurseName: seededNurses[1].name,
        recordedAt: new Date(),
      },
    });

    await Appointment.create({
      appointmentId: "APT-2026-103",
      patientId: seededPatients[2]._id,
      patientName: seededPatients[2].name,
      patientPhone: seededPatients[2].phone,
      patientEmail: seededPatients[2].email,
      hospitalId: hospital1._id,
      hospitalName: hospital1.name,
      doctorId: seededDoctors[2]._id,
      doctorName: seededDoctors[2].name,
      departmentId: deptPedi._id,
      departmentName: deptPedi.name,
      appointmentDate: today,
      timeSlot: "11:00 AM",
      type: "IN_PERSON",
      status: "CONFIRMED",
      tokenNumber: "PEDI-103",
      notes: "Follow up pediatric consultation.",
    });
    console.log(`   ✓ Token 3: PEDI-103 (${seededPatients[2].name} -> ${seededDoctors[2].name}) -> Vitals: RECORDED`);

    // Token 4: Patient Selvam visiting Dr. Suresh (Hospital 2, ORTHO)
    await QueueToken.create({
      tokenNumber: "ORTHO-201",
      tokenSequence: 201,
      tokenDate: today,
      patientName: seededPatients[4].name,
      patientPhone: seededPatients[4].phone,
      patientId: seededPatients[4]._id,
      doctorId: seededDoctors[3]._id,
      doctorName: seededDoctors[3].name,
      departmentId: deptOrtho._id,
      departmentName: deptOrtho.name,
      hospitalId: hospital2._id,
      hospitalName: hospital2.name,
      opdRoomNo: "Room 201",
      priority: "NORMAL",
      status: "WAITING",
      vitalsStatus: "PENDING",
    });

    await Appointment.create({
      appointmentId: "APT-2026-201",
      patientId: seededPatients[4]._id,
      patientName: seededPatients[4].name,
      patientPhone: seededPatients[4].phone,
      patientEmail: seededPatients[4].email,
      hospitalId: hospital2._id,
      hospitalName: hospital2.name,
      doctorId: seededDoctors[3]._id,
      doctorName: seededDoctors[3].name,
      departmentId: deptOrtho._id,
      departmentName: deptOrtho.name,
      appointmentDate: today,
      timeSlot: "10:30 AM",
      type: "IN_PERSON",
      status: "CHECKED_IN",
      tokenNumber: "ORTHO-201",
      notes: "Right knee osteoarthritis and mobility stiffness.",
    });
    console.log(`   ✓ Token 4: ORTHO-201 (${seededPatients[4].name} -> ${seededDoctors[3].name}) -> Vitals: PENDING`);

    // Appointment 5: Patient Divya visiting Dr. Meena (Hospital 2, CARD)
    await Appointment.create({
      appointmentId: "APT-2026-202",
      patientId: seededPatients[3]._id,
      patientName: seededPatients[3].name,
      patientPhone: seededPatients[3].phone,
      patientEmail: seededPatients[3].email,
      hospitalId: hospital2._id,
      hospitalName: hospital2.name,
      doctorId: seededDoctors[4]._id,
      doctorName: seededDoctors[4].name,
      departmentId: deptCard._id,
      departmentName: deptCard.name,
      appointmentDate: today,
      timeSlot: "02:00 PM",
      type: "IN_PERSON",
      status: "SCHEDULED",
      notes: "Pre-employment cardiac and wellness screening.",
    });
    console.log(`   ✓ Appointment 5: APT-2026-202 (${seededPatients[3].name} -> ${seededDoctors[4].name}) -> SCHEDULED`);

    console.log("\n=====================================================================");
    console.log("   🎉 DATABASE RESET & SEEDING COMPLETED WITH FULL SUCCESS!          ");
    console.log("=====================================================================");
    console.log("\n📋 MASTER CREDENTIALS SUMMARY (Password: Password123! for all staff & patients):");
    console.log("---------------------------------------------------------------------");
    console.log("🛡️ Super Admin:       admin@gmail.com          / Admin@123");
    console.log("👨‍⚕️ Dr. Gokul R:        gokul@gmail.com          / Password123! (or DOC-101)");
    console.log("👨‍⚕️ Dr. Priya:          priya@gmail.com          / Password123! (or DOC-102)");
    console.log("👨‍⚕️ Dr. Rajesh:         rajesh@gmail.com         / Password123! (or DOC-103)");
    console.log("👨‍⚕️ Dr. Suresh:         suresh@gmail.com         / Password123! (or DOC-201)");
    console.log("👨‍⚕️ Dr. Meena:          meena@gmail.com          / Password123! (or DOC-202)");
    console.log("👨‍⚕️ Dr. Arun:           arun@gmail.com           / Password123! (or DOC-203)");
    console.log("👩‍⚕️ Nurse Anitha:       anitha@gmail.com         / Password123! (or NUR-101)");
    console.log("👩‍⚕️ Nurse Deepa:        deepa@gmail.com          / Password123! (or NUR-102)");
    console.log("👩‍⚕️ Nurse Saranya:      saranya@gmail.com        / Password123! (or NUR-201)");
    console.log("👩‍⚕️ Nurse Kavya:        kavya@gmail.com          / Password123! (or NUR-202)");
    console.log("💼 Receptionist Ramesh: ramesh@gmail.com         / Password123! (or REC-101)");
    console.log("💼 Receptionist Karthik:karthik@gmail.com        / Password123! (or REC-201)");
    console.log("🧑 Patient Murugan:     murugan@gmail.com        / Password123!");
    console.log("🧑 Patient Kavitha:     kavitha@gmail.com        / Password123!");
    console.log("🧑 Patient Vignesh:     vignesh@gmail.com        / Password123!");
    console.log("🧑 Patient Divya:       divya@gmail.com          / Password123!");
    console.log("🧑 Patient Selvam:      selvam@gmail.com         / Password123!");
    console.log("---------------------------------------------------------------------\n");

  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    console.log("Database connection closed.");
  }
}

clearAndSeedDatabase();
