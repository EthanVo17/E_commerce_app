import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import type { Auth } from "../types/Auth.type.js";

function requiredSecret(name: string): string {
  const secret = process.env[name];
  if (!secret || secret.length < 32) throw new Error(`${name} must be at least 32 characters`);
  return secret;
}
const accessSecret: string = requiredSecret("JWT_SECRET");
const refreshSecret: string = requiredSecret("JWT_REFRESH_SECRET");
if (accessSecret === refreshSecret) {
  throw new Error("JWT secrets must be different");
}

export const REFRESH_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
export type UserRole = Auth["role"];
type AuthPayload = JwtPayload & { userId: string; role: UserRole; tokenType: "access" | "refresh" };

export function generateAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role, tokenType: "access" }, accessSecret, { algorithm: "HS256", expiresIn: "15m" });
}
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, tokenType: "refresh" }, refreshSecret, { algorithm: "HS256", expiresIn: "7d", jwtid: randomUUID() });
}
function verify(token: string, secret: string, tokenType: AuthPayload["tokenType"]): AuthPayload {
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  if (typeof payload === "string" || payload.tokenType !== tokenType || typeof payload.userId !== "string" || !/^[a-f\d]{24}$/i.test(payload.userId)) {
    throw new Error("Invalid token payload");
  }
  if (tokenType === "access" && !["user", "admin", "seller"].includes(String(payload.role))) throw new Error("Invalid role");
  return payload as AuthPayload;
}
export function verifyAccessToken(token: string): AuthPayload { return verify(token, accessSecret, "access"); }
export function verifyRefreshToken(token: string): AuthPayload { return verify(token, refreshSecret, "refresh"); }
