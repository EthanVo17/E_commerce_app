import express from "express";
import { rateLimit } from "express-rate-limit";
import { Login, Register, Refresh, Logout } from "../controllers/Auth.js";
import {
  Signup,
  VerifyPhoneOtp,
  ResendPhoneOtp,
} from "../controllers/SignupController.js";
import { RequireAuth } from "../middlewares/RequireAuth.js";
import UserModel from "../models/User.model.js";
import { publicUser } from "../utils/session.js";

const router: express.Router = express.Router();

/* ─────────────────────────── Rate Limiters ─────────────────────────── */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút." },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Quá nhiều lần yêu cầu đăng ký từ địa chỉ IP này. Vui lòng thử lại sau." },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Quá nhiều lần thử xác thực OTP. Vui lòng thử lại sau 15 phút." },
});

const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Quá nhiều lần yêu cầu gửi lại OTP. Vui lòng thử lại sau." },
});

/* ─────────────────────────── Routes ─────────────────────────── */

// Login & Session routes
router.post("/login", loginLimiter, Login);
router.post("/refresh", refreshLimiter, Refresh);
router.post("/logout", Logout);
router.post("/register", signupLimiter, Register);

// Phone OTP Sign-Up flow
router.post("/signup", signupLimiter, Signup);
router.post("/verify-phone-otp", verifyOtpLimiter, VerifyPhoneOtp);
router.post("/resend-phone-otp", resendOtpLimiter, ResendPhoneOtp);

// Authenticated user profile
router.get("/me", RequireAuth, async (_req, res) => {
  const user = await UserModel.findById(res.locals.user.userId);
  if (!user) {
    res.status(401).json({ message: "User not found." });
    return;
  }
  res.json({ user: publicUser(user) });
});

export { router };
