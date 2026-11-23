import type { Request, Response } from "express";
import { z } from "zod";
import UserModel from "../models/User.model.js";
import { OtpService } from "../services/OtpService.js";
import { SmsService } from "../services/SmsService.js";
import { normalizePhone, isValidPhoneNumber, maskPhone } from "../utils/phoneNumber.js";
import { startSession, publicUser } from "../utils/session.js";

/* ─────────────────────────── Zod Schemas ─────────────────────────── */

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .transform(normalizePhone)
  .refine(isValidPhoneNumber, {
    message: "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567).",
  });

const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Họ tên không được để trống.")
      .max(100, "Họ tên không được vượt quá 100 ký tự."),
    phoneNumber: phoneSchema,
    password: z
      .string()
      .min(8, "Mật khẩu phải chứa ít nhất 8 ký tự.")
      .max(72, "Mật khẩu không được dài quá 72 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ in hoa.")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ in thường.")
      .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

const verifyOtpSchema = z
  .object({
    phoneNumber: phoneSchema,
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Mã OTP phải gồm 6 chữ số."),
  })
  .strict();

const resendOtpSchema = z
  .object({
    phoneNumber: phoneSchema,
  })
  .strict();

/** Helper to extract client IP address accurately */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

/* ─────────────────────────── Controllers ─────────────────────────── */

/**
 * POST /api/auth/signup
 * Step 1: Validate info, create/update unverified user, apply rate limit, send OTP SMS.
 */
export async function Signup(req: Request, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Dữ liệu đăng ký không hợp lệ.";
    res.status(400).json({ message: firstError });
    return;
  }

  const { fullName, phoneNumber, password } = parsed.data;
  const ip = getClientIp(req);

  // 1. Check existing user
  const existingUser = await UserModel.findOne({ phoneNumber });

  if (existingUser && existingUser.isPhoneVerified) {
    res.status(409).json({ message: "Số điện thoại đã được đăng ký." });
    return;
  }

  // 2. Multi-tier Rate Limiting for SMS Spam Protection
  // Cooldown check: 60s
  const inCooldown = await OtpService.checkCooldown(phoneNumber);
  if (inCooldown) {
    res.status(429).json({
      message: "Vui lòng chờ 60 giây trước khi yêu cầu mã OTP mới.",
    });
    return;
  }

  // Hourly limit check: max 3 SMS/hour per phone & IP
  const hourlyCheck = await OtpService.checkHourlyLimit(phoneNumber, ip);
  if (hourlyCheck.exceeded) {
    res.status(429).json({
      message: "Bạn đã vượt quá giới hạn gửi SMS trong giờ này (tối đa 3 lần/giờ). Vui lòng thử lại sau.",
    });
    return;
  }

  // 3. Create or update user account (with isPhoneVerified: false)
  if (existingUser) {
    existingUser.name = fullName;
    existingUser.password = password; // pre('save') hook will hash it
    await existingUser.save();
  } else {
    await UserModel.create({
      name: fullName,
      phoneNumber,
      password,
      isPhoneVerified: false,
    });
  }

  // 4. Generate, Hash (SHA-256) & Store OTP in Redis (TTL 180s)
  const otp = await OtpService.generateAndStore(phoneNumber, ip);

  // 5. Send OTP via SMS service (mock in dev, real in prod)
  await SmsService.sendOtp(phoneNumber, otp);

  res.status(200).json({
    message: "Mã OTP đã được gửi đến số điện thoại của bạn.",
    phoneNumber,
    maskedPhone: maskPhone(phoneNumber),
  });
}

/**
 * POST /api/auth/verify-phone-otp
 * Step 2: Validate 6-digit OTP with 5 attempts max.
 * On success: mark isPhoneVerified=true, issue JWT access + refresh tokens in HttpOnly cookie.
 */
export async function VerifyPhoneOtp(req: Request, res: Response): Promise<void> {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Mã OTP không hợp lệ.";
    res.status(400).json({ message: firstError });
    return;
  }

  const { phoneNumber, otp } = parsed.data;

  // 1. Verify OTP with attempts limit
  const result = await OtpService.verify(phoneNumber, otp);

  if (!result.success) {
    if (result.reason === "expired") {
      res.status(400).json({
        message: "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.",
      });
      return;
    }

    if (result.reason === "max_attempts_exceeded") {
      res.status(429).json({
        message: "Bạn đã nhập sai mã OTP quá 5 lần. Mã đã bị hủy để bảo mật. Vui lòng gửi lại mã mới.",
      });
      return;
    }

    // Invalid code with remaining attempts
    res.status(400).json({
      message: `Mã OTP không chính xác. Bạn còn ${result.remainingAttempts} lần thử.`,
    });
    return;
  }

  // 2. Fetch and activate user
  const user = await UserModel.findOne({ phoneNumber });
  if (!user) {
    res.status(404).json({ message: "Không tìm thấy thông tin tài khoản." });
    return;
  }

  user.isPhoneVerified = true;
  await user.save();

  // 3. Automatic login: issue Access Token + Refresh Token (HttpOnly, Secure cookie)
  const accessToken = await startSession(user, res, true);

  res.status(200).json({
    message: "Xác thực số điện thoại thành công.",
    user: publicUser(user),
    accessToken,
  });
}

/**
 * POST /api/auth/resend-phone-otp
 * Resend OTP with 60-second cooldown and hourly limit checks.
 */
export async function ResendPhoneOtp(req: Request, res: Response): Promise<void> {
  const parsed = resendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Số điện thoại không hợp lệ." });
    return;
  }

  const { phoneNumber } = parsed.data;
  const ip = getClientIp(req);

  // 1. User check
  const user = await UserModel.findOne({ phoneNumber });
  if (!user) {
    res.status(404).json({ message: "Số điện thoại chưa được đăng ký." });
    return;
  }

  if (user.isPhoneVerified) {
    res.status(400).json({ message: "Số điện thoại này đã được xác thực trước đó." });
    return;
  }

  // 2. Rate limit & cooldown checks
  const inCooldown = await OtpService.checkCooldown(phoneNumber);
  if (inCooldown) {
    res.status(429).json({
      message: "Vui lòng chờ 60 giây trước khi gửi lại mã OTP.",
    });
    return;
  }

  const hourlyCheck = await OtpService.checkHourlyLimit(phoneNumber, ip);
  if (hourlyCheck.exceeded) {
    res.status(429).json({
      message: "Bạn đã vượt quá giới hạn gửi SMS trong giờ này (tối đa 3 lần/giờ). Vui lòng thử lại sau.",
    });
    return;
  }

  // 3. Generate new OTP & store in Redis
  const otp = await OtpService.generateAndStore(phoneNumber, ip);

  // 4. Send SMS
  await SmsService.sendOtp(phoneNumber, otp);

  res.status(200).json({
    message: "Mã OTP mới đã được gửi đến số điện thoại của bạn.",
    phoneNumber,
  });
}
