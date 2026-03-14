import { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { comparePassword, encryptPassword } from "../../utils/auth/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../../utils/auth/helper.js";
import { IJwtUserPayload } from "../../types/index.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

// Handles user registration
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(409, "User already exists");

  const hashedPassword = await encryptPassword(password);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
      "User registered successfully"
    )
  );
});

// Handles user login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
      "Login successful"
    )
  );
});

// Handles logout — clears cookies properly
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, createdAt: true },
  });
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// Issues a new access token using a valid refresh token
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded: IJwtUserPayload;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_TOKEN) as IJwtUserPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new ApiError(404, "User not found");

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Rotate refresh token on every refresh
  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      { accessToken: newAccessToken },
      "Token refreshed successfully"
    )
  );
});