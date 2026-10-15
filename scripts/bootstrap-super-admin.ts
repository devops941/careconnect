import dotenv from "dotenv";
dotenv.config();

import { bootstrapSuperAdmin } from "../src/server/bootstrap/super-admin.bootstrap";
import { connectToDatabase, disconnectDatabase } from "../src/server/database/mongodb";

async function run() {
  console.log("=================================================");
  console.log("   CareConnect - Super Admin Bootstrap Runner    ");
  console.log("=================================================\n");

  try {
    console.log("1. Connecting to database...");
    await connectToDatabase();
    console.log("   Connected to MongoDB successfully.\n");

    console.log("2. Provisioning initial Super Admin...");
    const result = await bootstrapSuperAdmin();

    console.log(`\nBootstrap Status: ${result.status}`);
    console.log(`Details: ${result.message}`);

    if (result.status === "CREATED") {
      console.log(`\n✅ Super Admin account is ready for sign in.`);
    } else if (result.status === "ALREADY_EXISTS") {
      console.log(`\nℹ️  Account already configured. No duplicate changes made.`);
    } else {
      console.error(`\n❌ Bootstrap failed.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\n❌ Fatal error during Super Admin bootstrap:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    console.log("\nDatabase connection closed.");
  }
}

run();
