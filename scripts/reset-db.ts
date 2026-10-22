import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";
import { bootstrapSuperAdmin } from "../src/server/bootstrap/super-admin.bootstrap";

export async function resetDatabase() {
  console.log("=====================================================================");
  console.log("             🏥 CareConnect - Complete Database Reset                ");
  console.log("=====================================================================\n");

  try {
    await connectToDatabase();
    console.log("1. Connected to MongoDB successfully.");

    // Step 1: Clear all collections
    console.log("\n2. Emptying all existing collections...");
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.collections();
      for (const col of collections) {
        await col.deleteMany({});
        console.log(`   ✓ Emptied collection: ${col.collectionName}`);
      }
    }
    console.log("   ✅ All existing data cleared successfully.\n");

    // Step 2: Bootstrap Super Admin
    console.log("3. Bootstrapping Super Admin account...");
    const superAdminResult = await bootstrapSuperAdmin();
    console.log(`   ✓ Status: ${superAdminResult.status}`);
    console.log(`   ✓ Details: ${superAdminResult.message}\n`);

    console.log("\n=====================================================================");
    console.log("  🎉 SUCCESS: Database Cleared & Only Super Admin Provisioned!       ");
    console.log("=====================================================================");
    console.log("\n👤 Super Admin Login Credentials:");
    console.log("---------------------------------------------------------------------");
    console.log("• Super Admin:        admin@gmail.com                 / Admin@123");
    console.log("• Role:               SUPER_ADMIN");
    console.log("---------------------------------------------------------------------\n");

  } catch (error) {
    console.error("❌ Database reset failed with error:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    console.log("Database connection closed.");
  }
}

resetDatabase();
