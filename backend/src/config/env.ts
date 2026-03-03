import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../.env", import.meta.url) });

const envSchema = z.object({
  //Server
  PORT: z.string().default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),

  //Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  //Auth
  JWT_ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, "JWT_ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("7d"),
  JWT_REFRESH_TOKEN: z.string().min(1, "JWT_REFRESH_TOKEN is required"),
  REFRESH_TOKEN_EXPIRY: z.string().default("30d"),

  //AI
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
