import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { IJwtUserPayload } from "../types/index.js";
import { prisma } from "../config/prisma.js";

export const verifyJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_TOKEN_SECRET
    ) as IJwtUserPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) throw new ApiError(401, "Unauthorized request");

    req.user = user;
    next();
  }
);
