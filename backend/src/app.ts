import express, { NextFunction, Request, Response } from "express";
import { prisma } from "./config/prisma.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import userRouter from "./modules/user/user.routes.js";
import noteRouter from "./modules/note/note.routes.js";
import aiRouter from "./modules/ai/ai.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { env } from "./config/env.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiter for auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI chat — 20 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many AI requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint for monitoring server availability
app.get("/health-check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.get("/test", async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany();
    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error: unknown) {
    console.error(error);
  }
});

// Mount API route handlers with global error handling middleware
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/ai", aiLimiter, aiRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
});
