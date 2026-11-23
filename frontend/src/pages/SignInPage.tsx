import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^(?:0\d{9}|\+84\d{9})$/,
      "Nhập số điện thoại hợp lệ (VD: 0912345678).",
    ),
  password: z
    .string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
    .max(72, "Mật khẩu không được vượt quá 72 ký tự."),
  rememberMe: z.boolean(),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phoneNumber: "", password: "", rememberMe: false },
  });

  const onSubmit = async ({ rememberMe, ...credentials }: LoginForm) => {
    setServerError("");
    try {
      const response = await signIn({ ...credentials, rememberMe });
      setAuth(response.user, response.accessToken);

      // Hiển thị thông báo chào mừng (Toast notification)
      addToast(
        `Đăng nhập thành công! Chào mừng ${response.user.fullName}`,
        "success",
      );

      // Điều hướng thông minh: ưu tiên state.from -> query param callbackUrl/from -> trang chủ (/)
      const searchParams = new URLSearchParams(location.search);
      const callbackUrl =
        searchParams.get("callbackUrl") || searchParams.get("from");
      const stateFrom = (location.state as { from?: string } | null)?.from;
      const redirectTarget = stateFrom || callbackUrl;
      const destination =
        redirectTarget &&
        redirectTarget.startsWith("/") &&
        !redirectTarget.startsWith("//")
          ? redirectTarget
          : "/";

      navigate(destination, { replace: true });
    } catch (error) {
      const message = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      setServerError(message ?? "Không thể kết nối. Vui lòng thử lại.");
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-orange-900/5 sm:p-9">
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
        <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">
          Đăng nhập
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Chào mừng bạn quay trở lại.
        </p>

        <form
          className="mt-7 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label
              htmlFor="phoneNumber"
              className="text-sm font-semibold text-slate-700"
            >
              Số điện thoại
            </label>
            <input
              id="phoneNumber"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0912345678"
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
              className={inputClass}
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p
                id="phone-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`${inputClass} pr-20`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-3 my-auto h-10 px-2 text-sm font-medium text-slate-500 hover:text-orange-600"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 accent-orange-600"
                {...register("rememberMe")}
              />{" "}
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/support"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {serverError && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </p>
          )}

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
            {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            to="/signup"
            className="font-semibold text-orange-600 hover:underline"
          >
            Đăng ký
          </Link>
        </p>
      </section>
    </main>
  );
}
