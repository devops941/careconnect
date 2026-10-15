import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToDatabase, disconnectDatabase } from "@/server/database/mongodb";

let mongod: MongoMemoryServer | null = null;

export async function setupTestDatabase(): Promise<string> {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    (process.env as Record<string, string>).NODE_ENV = "test";
    await connectToDatabase();
  }
  return mongod.getUri();
}

export async function clearTestDatabase(): Promise<void> {
  await connectToDatabase();
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await disconnectDatabase();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
