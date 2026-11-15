import express from "express";
import { rateLimit } from "express-rate-limit";
import { Login, Register, Refresh, Logout } from "../controllers/Auth.js";
import { RequireAuth } from "../middlewares/RequireAuth.js";

const router: express.Router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many login attempts. Try again later." } });
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
router.post("/login", loginLimiter, Login);
router.post("/refresh", refreshLimiter, Refresh);
router.post("/logout", Logout);
router.post("/register", registerLimiter, Register);
router.get("/user", RequireAuth, (_req, res) => res.json({ user: res.locals.user }));
export { router };
