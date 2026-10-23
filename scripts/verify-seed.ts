import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";
import { authService } from "../src/server/services/auth.service";

async function verify() {
  await connectToDatabase();
  console.log("Connected to MongoDB for auth verification.");

  const testUsers = [
    { email: "admin@gmail.com", pass: "Admin@123", role: "SUPER_ADMIN" },
    { email: "gokul@gmail.com", pass: "Password123!", role: "DOCTOR" },
    { email: "anitha@gmail.com", pass: "Password123!", role: "NURSE" },
    { email: "ramesh@gmail.com", pass: "Password123!", role: "RECEPTIONIST" },
    { email: "murugan@gmail.com", pass: "Password123!", role: "PATIENT" },
    // Also test by Employee ID
    { email: "DOC-101", pass: "Password123!", role: "DOCTOR" },
    { email: "NUR-101", pass: "Password123!", role: "NURSE" },
  ];

  for (const u of testUsers) {
    try {
      const res = await authService.loginWithCredentials({ email: u.email, password: u.pass });
      console.log(`✅ Auth PASS: [${u.email}] -> Authenticated as ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      console.error(`❌ Auth FAIL: [${u.email}] -> ${err?.message || err}`);
    }
  }

  await disconnectDatabase();
  console.log("Verification finished.");
}

verify();
