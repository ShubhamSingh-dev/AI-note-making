import { Response } from "express";

// Sets secure HTTP-only cookies for access token (15 min) and refresh token (7 days)
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  // Access token cookie - 15 minutes expiration
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 15,
  });
  // Refresh token cookie - 7 days expiration
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};
