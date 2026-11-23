import { createHash, randomInt } from "node:crypto";
import redis from "../config/redis.js";

const OTP_TTL = 180; // 3 minutes
const COOLDOWN_TTL = 60; // 1 minute
const HOURLY_TTL = 3600; // 1 hour
export const MAX_ATTEMPTS = 5;
export const MAX_HOURLY_SMS = 3;

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export const RedisKeys = {
  otp: (phone: string) => `otp:${phone}`,
  attempts: (phone: string) => `otp_attempts:${phone}`,
  cooldown: (phone: string) => `otp_cooldown:${phone}`,
  hourlyPhone: (phone: string) => `otp_hourly:${phone}`,
  hourlyIp: (ip: string) => `otp_hourly_ip:${ip}`,
};

export type VerifyOtpResult =
  | { success: true }
  | { success: false; reason: "expired" | "max_attempts_exceeded" | "invalid_code"; remainingAttempts?: number };

export class OtpService {
  /**
   * Check whether the phone is still in the 60-second cooldown window.
   * Returns `true` when a new OTP may NOT be sent yet.
   */
  static async checkCooldown(phone: string): Promise<boolean> {
    const exists = await redis.exists(RedisKeys.cooldown(phone));
    return exists === 1;
  }

  /**
   * Check per-phone AND per-IP hourly SMS limits.
   * Returns `true` when the limit has been exceeded.
   */
  static async checkHourlyLimit(phone: string, ip: string): Promise<{ exceeded: boolean; reason?: "phone" | "ip" }> {
    const [phoneCount, ipCount] = await Promise.all([
      redis.get(RedisKeys.hourlyPhone(phone)),
      redis.get(RedisKeys.hourlyIp(ip)),
    ]);

    if (Number(phoneCount ?? 0) >= MAX_HOURLY_SMS) {
      return { exceeded: true, reason: "phone" };
    }
    if (Number(ipCount ?? 0) >= MAX_HOURLY_SMS) {
      return { exceeded: true, reason: "ip" };
    }
    return { exceeded: false };
  }

  /**
   * Generate a 6-digit OTP, hash it and store in Redis with a 180s TTL.
   * Also sets the 60s cooldown flag and increments hourly counters.
   * Returns the plaintext OTP (to be sent via SMS).
   */
  static async generateAndStore(phone: string, ip: string): Promise<string> {
    const otp = String(randomInt(100000, 999999));
    const hashed = hashOtp(otp);

    const pipe = redis.pipeline();

    // Store hashed OTP for 3 minutes (180s)
    pipe.set(RedisKeys.otp(phone), hashed, "EX", OTP_TTL);

    // Reset attempt counter
    pipe.set(RedisKeys.attempts(phone), "0", "EX", OTP_TTL);

    // Set 60s cooldown between resends
    pipe.set(RedisKeys.cooldown(phone), "1", "EX", COOLDOWN_TTL);

    // Increment hourly counters (phone & IP)
    pipe.incr(RedisKeys.hourlyPhone(phone));
    pipe.expire(RedisKeys.hourlyPhone(phone), HOURLY_TTL);

    pipe.incr(RedisKeys.hourlyIp(ip));
    pipe.expire(RedisKeys.hourlyIp(ip), HOURLY_TTL);

    await pipe.exec();

    return otp;
  }

  /**
   * Verify an OTP code.
   * Tracks wrong attempts (max 5); deletes key immediately if attempts exceeded.
   */
  static async verify(phone: string, otp: string): Promise<VerifyOtpResult> {
    const stored = await redis.get(RedisKeys.otp(phone));
    if (!stored) {
      return { success: false, reason: "expired" };
    }

    const hashed = hashOtp(otp);

    if (hashed === stored) {
      // Correct: clean up OTP keys
      await this.cleanup(phone);
      return { success: true };
    }

    // Wrong: increment attempt counter
    const attempts = await redis.incr(RedisKeys.attempts(phone));
    if (attempts >= MAX_ATTEMPTS) {
      // Over limit: delete OTP immediately
      await this.cleanup(phone);
      return { success: false, reason: "max_attempts_exceeded" };
    }

    const remaining = MAX_ATTEMPTS - attempts;
    return { success: false, reason: "invalid_code", remainingAttempts: remaining };
  }

  /**
   * Clean up all OTP-related keys for a phone number.
   */
  static async cleanup(phone: string): Promise<void> {
    await redis.del(
      RedisKeys.otp(phone),
      RedisKeys.attempts(phone),
      RedisKeys.cooldown(phone),
    );
  }
}
