import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { IUser } from "../../types/index.js";
import { env } from "../../config/env.js";

// Generates JWT access token with user identity claims and configured expiration
export const generateAccessToken = (user: IUser): string => {
  const accessTokenSecret = env.JWT_ACCESS_TOKEN_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    accessTokenSecret,
    options
  );
};

// Generates JWT refresh token with longer expiration for obtaining new access tokens
export const generateRefreshToken = (user: IUser): string => {
  const refreshTokenSecret = env.JWT_REFRESH_TOKEN as Secret;
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    refreshTokenSecret,
    options
  );
};
