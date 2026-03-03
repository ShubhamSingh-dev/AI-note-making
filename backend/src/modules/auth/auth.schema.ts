import { z } from "zod";

// Zod schema for validating user registration input
export const registerUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .trim()
      .toLowerCase(),
    email: z.email().trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .trim(),
  })
  .strict();

// Zod schema for validating user login input
export const loginUserSchema = z
  .object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password cannot be empty").trim(),
  })
  .strict();

// Type-safe types inferred from validation schemas
export type RegisterInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
