import mongoose from "mongoose";
import { getEnv } from "../validation/env";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
  // eslint-disable-next-line no-var
  var hasBootstrappedSuperAdmin: boolean | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    cached!.conn = mongoose;
    return mongoose;
  }

  if (cached?.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const mongoUri = process.env.MONGODB_URI || getEnv().MONGODB_URI;
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    
    // Auto-bootstrap Super Admin on startup (only once, non-blocking for normal requests)
    if (!global.hasBootstrappedSuperAdmin && process.env.NODE_ENV !== "test") {
      global.hasBootstrappedSuperAdmin = true;
      import("../bootstrap/super-admin.bootstrap").then(({ bootstrapSuperAdmin }) => {
        bootstrapSuperAdmin().catch((e) => console.error("Auto bootstrap error:", e));
      });
    }
  } catch (err) {
    cached!.promise = null;
    throw err;
  }

  return cached!.conn;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
}
