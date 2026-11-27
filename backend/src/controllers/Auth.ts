import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { z } from "zod";
import UserModel from "../models/User.model.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_LIFETIME_MS,
  verifyRefreshToken,
} from "../jwt/jwt.js";
import type { Auth } from "../types/Auth.type.js";
import { normalizePhone, isValidPhoneNumber } from "../utils/phoneNumber.js";

const COOKIE_NAME = "refreshToken";
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-real-user-password", 10);
const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine(isValidPhoneNumber, "Invalid phone number");
const loginSchema = z
  .object({
    phoneNumber: phoneSchema,
    password: z.string().min(1).max(72),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();
const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
});
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  path: "/",
};
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const readRefreshToken = (req: Request) =>
  typeof req.cookies?.[COOKIE_NAME] === "string"
    ? (req.cookies[COOKIE_NAME] as string)
    : null;
function setRefreshCookie(res: Response, token: string, rememberMe = true) {
  res.cookie(
    COOKIE_NAME,
    token,
    rememberMe
      ? { ...cookieOptions, maxAge: REFRESH_LIFETIME_MS }
      : { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 },
  );
}
function clearRefreshCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}
function publicUser(user: Auth) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatar ?? null,
    role: user.role,
  };
}
async function startSession(user: Auth, res: Response, rememberMe = true) {
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

export async function Login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Enter a valid phone number and password." });
    return;
  }
  const { phoneNumber, password, rememberMe } = parsed.data;
  const user = await UserModel.findOne({ phoneNumber }).select("+password");
  // Always run a bcrypt comparison so invalid phone numbers have similar cost.
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_PASSWORD_HASH,
  );
  if (!user || !passwordMatches) {
    res.status(401).json({ message: "Phone number or password is incorrect." });
    return;
  }
  if (!user.isPhoneVerified) {
    res.status(403).json({
      message:
        "Số điện thoại chưa được xác thực. Vui lòng xác thực mã OTP để đăng nhập.",
      isPhoneVerified: false,
      phoneNumber: user.phoneNumber,
    });
    return;
  }
  if (user.locked && user.locked.getTime() > Date.now()) {
    res
      .status(429)
      .json({ message: "Too many login attempts. Try again later." });
    return;
  }
  const accessToken = await startSession(user, res, rememberMe);
  res.status(200).json({
    message: "Signed in successfully.",
    user: publicUser(user),
    accessToken,
  });
}

export async function Register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message:
        "Enter valid account details. Password must contain 8 to 72 characters.",
    });
    return;
  }
  try {
    const user = await UserModel.create(parsed.data);
    const accessToken = await startSession(user, res);
    res.status(201).json({
      message: "Account created.",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res
        .status(409)
        .json({ message: "An account with these details already exists." });
      return;
    }
    throw error;
  }
}

export async function Refresh(req: Request, res: Response): Promise<void> {
  const token = readRefreshToken(req);
  if (!token) {
    res.status(401).json({ message: "Please sign in again." });
    return;
  }
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({ message: "Please sign in again." });
    return;
  }
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    clearRefreshCookie(res);
    res.status(401).json({ message: "Please sign in again." });
    return;
  }
  const refreshToken = generateRefreshToken(user._id.toString());
  const session = await RefreshTokenModel.findOneAndUpdate(
    {
      userId: user._id,
      tokenHash: hashToken(token),
      expireAt: { $gt: new Date() },
    },
    {
      $set: {
        tokenHash: hashToken(refreshToken),
        expireAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
      },
    },
    { returnDocument: "after" },
  );
  if (!session) {
    clearRefreshCookie(res);
    res.status(401).json({ message: "Session expired. Please sign in again." });
    return;
  }
  setRefreshCookie(res, refreshToken, session.rememberMe);
  res.status(200).json({
    user: publicUser(user),
    accessToken: generateAccessToken(user._id.toString(), user.role),
  });
}

export async function Logout(req: Request, res: Response): Promise<void> {
  const token = readRefreshToken(req);
  if (token) await RefreshTokenModel.deleteOne({ tokenHash: hashToken(token) });
  clearRefreshCookie(res);
  res.status(204).end();
}
