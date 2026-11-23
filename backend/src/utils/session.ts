import type { Response } from "express";
import { createHash } from "node:crypto";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_LIFETIME_MS,
} from "../jwt/jwt.js";
import type { Auth } from "../types/Auth.type.js";

export const COOKIE_NAME = "refreshToken";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  path: "/",
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setRefreshCookie(
  res: Response,
  token: string,
  rememberMe = true,
): void {
  res.cookie(
    COOKIE_NAME,
    token,
    rememberMe
      ? { ...cookieOptions, maxAge: REFRESH_LIFETIME_MS }
      : { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 },
  );
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export function publicUser(user: Auth) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatar ?? null,
    role: user.role,
  };
}

export async function startSession(
  user: Auth,
  res: Response,
  rememberMe = true,
): Promise<string> {
  const userId = user._id.toString();
  const refreshToken = generateRefreshToken(userId);
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expireAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
    rememberMe,
  });
  setRefreshCookie(res, refreshToken, rememberMe);
  return generateAccessToken(userId, user.role);
}
