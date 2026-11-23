import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp, verifyPhoneOtp, resendPhoneOtp } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

/* ──────────────────────────── helpers ──────────────────────────── */

/** Strips everything except digits from a phone string. */
const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** Formats a local VN number (digits only) for display: `090 123 4567`. */
const formatPhoneDisplay = (raw: string): string => {
  const d = digitsOnly(raw);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
};

/** Mask a phone for OTP screen: `+84 90***4567`. */
const maskPhone = (phone: string): string => {
  const d = digitsOnly(phone);
  // d is in 0xx… format; convert to +84 display
  const withoutLeading = d.startsWith("0") ? d.slice(1) : d;
  if (withoutLeading.length < 4) return `+84 ${withoutLeading}`;
  return `+84 ${withoutLeading.slice(0, 2)}***${withoutLeading.slice(-4)}`;
};

type PasswordStrength = "weak" | "medium" | "strong";

const getPasswordStrength = (pw: string): PasswordStrength => {
  if (pw.length < 8) return "weak";
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const score = [hasUpper, hasLower, hasDigit].filter(Boolean).length;
  if (score === 3) return "strong";
  if (score >= 2) return "medium";
  return "weak";
};

const strengthConfig: Record<PasswordStrength, { width: string; color: string; label: string }> = {
  weak: { width: "w-1/3", color: "bg-red-500", label: "Yếu" },
  medium: { width: "w-2/3", color: "bg-yellow-500", label: "Trung bình" },
  strong: { width: "w-full", color: "bg-green-500", label: "Mạnh" },
};

/* ──────────────────────────── schemas ──────────────────────────── */

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên."),
    phoneNumber: z
      .string()
      .trim()
      .transform(digitsOnly)
      .pipe(z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678).")),
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu cần có ít nhất 1 chữ hoa.")
      .regex(/[a-z]/, "Mật khẩu cần có ít nhất 1 chữ thường.")
      .regex(/\d/, "Mật khẩu cần có ít nhất 1 chữ số."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

/* ─────────────────────────── constants ─────────────────────────── */

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

/* ═══════════════════════════ Component ═══════════════════════════ */

export default function SignUpPage() {
  /* ── shared state ── */
  const [step, setStep] = useState<1 | 2>(1);
  const [serverError, setServerError] = useState("");
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  /* ─────────────────── Step 1: Sign-up form ─────────────────── */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneDisplay, setPhoneDisplay] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", phoneNumber: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");
  const strength = getPasswordStrength(passwordValue ?? "");
  const { width, color, label } = strengthConfig[strength];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = digitsOnly(e.target.value).slice(0, 10);
    setValue("phoneNumber", raw, { shouldValidate: false });
    setPhoneDisplay(formatPhoneDisplay(raw));
  };

  const onSignUp = async (data: SignUpForm) => {
    setServerError("");
    try {
      const res = await signUp({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setPhoneForOtp(res.phoneNumber || data.phoneNumber);
      setStep(2);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      setServerError(message ?? "Không thể kết nối. Vui lòng thử lại.");
    }
  };

  /* ─────────────────── Step 2: OTP verification ─────────────── */
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start countdown when step changes to 2
  useEffect(() => {
    if (step !== 2) return;
    setCountdown(RESEND_COOLDOWN);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Focus first OTP input on step 2
  useEffect(() => {
    if (step === 2) {
      requestAnimationFrame(() => inputRefs.current[0]?.focus());
    }
  }, [step]);

  const setOtpAt = useCallback(
    (index: number, value: string) => {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [],
  );

  const handleOtpInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only single digit
    const digit = val.replace(/\D/g, "").slice(-1);
    setOtpAt(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        setOtpAt(index - 1, "");
        inputRefs.current[index - 1]?.focus();
      } else {
        setOtpAt(index, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = digitsOnly(e.clipboardData.getData("text")).slice(0, OTP_LENGTH);
    if (!pasted) return;
    const chars = pasted.split("");
    setOtp((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      return next;
    });
    const focusIdx = Math.min(chars.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const submitOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setOtpError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }
    setOtpError("");
    setOtpSubmitting(true);
    try {
      const response = await verifyPhoneOtp({ phoneNumber: phoneForOtp, otp: code });
      setAuth(response.user, response.accessToken);
      addToast(`Đăng ký thành công! Chào mừng ${response.user.fullName}`, "success");
      navigate("/", { replace: true });
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      setOtpError(message ?? "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtpError("");
    try {
      await resendPhoneOtp({ phoneNumber: phoneForOtp });
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      // restart timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message;
      setOtpError(message ?? "Không thể gửi lại mã. Vui lòng thử lại.");
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setServerError("");
  };

  /* ─────────────────────────── render ────────────────────────── */

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-orange-900/5 sm:p-9">
        {/* ── Logo ── */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-orange-600"
          aria-label="Shopee trang chủ"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-orange-500 text-white">
            S
          </span>{" "}
          Shopee
        </Link>

        {step === 1 ? (
          /* ═══════════════════ STEP 1 – Sign-up form ═══════════════════ */
          <>
            <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">Đăng ký</h1>
            <p className="mt-2 text-sm text-slate-500">Tạo tài khoản Shopee của bạn.</p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSignUp)} noValidate>
              {/* Full name */}
              <div>
                <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                  Họ tên
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "name-error" : undefined}
                  className={inputClass}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone number */}
              <div>
                <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">
                  Số điện thoại
                </label>
                <div className="relative mt-2 flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                    +84
                  </span>
                  <input
                    id="phoneNumber"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="090 123 4567"
                    value={phoneDisplay}
                    onChange={handlePhoneChange}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
                    className="w-full rounded-r-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
                {errors.phoneNumber && (
                  <p id="phone-error" className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`${inputClass} pr-20`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 my-auto h-10 px-2 text-sm font-medium text-slate-500 hover:text-orange-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {/* Password strength meter */}
                {passwordValue && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${width} ${color}`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Độ mạnh: <span className="font-medium">{label}</span>
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                    className={`${inputClass} pr-20`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 my-auto h-10 px-2 text-sm font-medium text-slate-500 hover:text-orange-600"
                    aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirm ? "Ẩn" : "Hiện"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-error" className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                  {serverError}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && (
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                )}
                {isSubmitting ? "Đang đăng ký…" : "Đăng ký"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link to="/signin" className="font-semibold text-orange-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </>
        ) : (
          /* ═══════════════════ STEP 2 – OTP verification ═══════════════ */
          <>
            <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">Xác thực OTP</h1>
            <p className="mt-2 text-sm text-slate-500">
              Mã xác thực đã được gửi đến{" "}
              <span className="font-semibold text-slate-700">{maskPhone(phoneForOtp)}</span>
            </p>
            <button
              type="button"
              onClick={goBackToStep1}
              className="mt-1 text-sm font-medium text-orange-600 hover:underline"
            >
              Đổi số điện thoại
            </button>

            {/* OTP inputs */}
            <div className="mt-7 flex items-center justify-center gap-2" role="group" aria-label="Mã xác thực OTP">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpInput(i, e)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Chữ số OTP ${i + 1}`}
                  className="h-14 w-12 rounded-lg border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              ))}
            </div>

            {/* OTP error */}
            {otpError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-center text-sm text-red-700" role="alert">
                {otpError}
              </p>
            )}

            {/* Verify button */}
            <button
              type="button"
              disabled={otpSubmitting}
              onClick={submitOtp}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpSubmitting && (
                <span
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              )}
              {otpSubmitting ? "Đang xác thực…" : "Xác thực"}
            </button>

            {/* Resend */}
            <p className="mt-5 text-center text-sm text-slate-500">
              Chưa nhận được mã?{" "}
              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleResend}
                className={`font-semibold ${countdown > 0 ? "cursor-not-allowed text-slate-400" : "text-orange-600 hover:underline"}`}
              >
                {countdown > 0 ? `Gửi lại mã OTP (${countdown}s)` : "Gửi lại mã OTP"}
              </button>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
