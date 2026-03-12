import { z } from "zod";

export const registerUserSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be under 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),

    email: z.email("Enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;
export type LoginFormData = z.infer<typeof loginUserSchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
