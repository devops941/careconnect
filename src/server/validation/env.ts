import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb+srv://devops_db_user:jcj8Mkf1GQKJ1ZGl@cluster0.uurxkmz.mongodb.net/careconnect?retryWrites=true&w=majority"),
  APP_URL: z.string().url("APP_URL must be a valid URL").default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters long").default("careconnect-ultra-secure-auth-secret-32-chars-long-test-key-2026"),
  AUTH_GOOGLE_ID: z.string().optional().or(z.literal("")),
  AUTH_GOOGLE_SECRET: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal("")),
  SUPER_ADMIN_NAME: z.string().min(2).default("Chief System Administrator"),
  SUPER_ADMIN_EMAIL: z.string().email("SUPER_ADMIN_EMAIL must be a valid email").default("admin@gmail.com"),
  SUPER_ADMIN_INITIAL_PASSWORD: z.string().min(8).optional().default("Admin@123"),
  EMAIL_PROVIDER: z.enum(["console", "resend", "smtp"]).default("console"),
  EMAIL_FROM: z.string().default("CareConnect Identity <noreply@careconnect.health>"),
  RESEND_API_KEY: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | undefined;

export function getEnv(): Env {
  if (parsedEnv && process.env.NODE_ENV !== "test") return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    console.error("❌ Invalid environment variables:", JSON.stringify(formatted, null, 2));
    throw new Error("Invalid application environment configuration");
  }

  if (process.env.NODE_ENV !== "test") {
    parsedEnv = result.data;
  }
  return result.data;
}
