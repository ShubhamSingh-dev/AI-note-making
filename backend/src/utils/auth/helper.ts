import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

// Sets secure HTTP-only cookies — secure flag only in production
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  // Access token — 15 minutes
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 15,
  });

  // Refresh token — 7 days
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    secure: isProd,
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};