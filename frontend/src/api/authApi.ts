import axiosClient from "./axiosClient";
import type {
  SignInPayload,
  AuthResponse,
  AuthUser,
  SignUpPayload,
  SignUpResponse,
  VerifyOtpPayload,
  ResendOtpPayload,
} from "@/types/auth";

/* ── Chuẩn hóa dữ liệu người dùng từ Backend ── */

interface RawAuthUser {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  role?: AuthUser["role"];
}

interface RawAuthResponse {
  message?: string;
  user?: RawAuthUser;
  accessToken?: string;
}

function normalizeUser(raw?: RawAuthUser): AuthUser {
  if (!raw) {
    return {
      id: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      avatarUrl: null,
      role: "user",
    };
  }
  return {
    id: raw.id || raw._id || "",
    fullName: raw.fullName || raw.name || "",
    email: raw.email || "",
    phoneNumber: raw.phoneNumber || "",
    avatarUrl: raw.avatarUrl ?? raw.avatar ?? null,
    role: raw.role || "user",
  };
}

function normalizeAuthResponse(raw: RawAuthResponse): AuthResponse {
  return {
    message: raw?.message || "Success",
    user: normalizeUser(raw?.user),
    accessToken: raw?.accessToken || "",
  };
}

/* ── API calls ── */

export const signIn = async (
  payload: SignInPayload & { rememberMe: boolean },
): Promise<AuthResponse> => {
  const response = await axiosClient.post<RawAuthResponse>(
    "/auth/login",
    payload,
  );
  return normalizeAuthResponse(response.data);
};

export const signUp = async (
  payload: SignUpPayload,
): Promise<SignUpResponse> => {
  const response = await axiosClient.post<SignUpResponse>(
    "/auth/signup",
    payload,
  );
  return response.data;
};

export const verifyPhoneOtp = async (
  payload: VerifyOtpPayload,
): Promise<AuthResponse> => {
  const response = await axiosClient.post<RawAuthResponse>(
    "/auth/verify-phone-otp",
    payload,
  );
  return normalizeAuthResponse(response.data);
};

export const resendPhoneOtp = async (
  payload: ResendOtpPayload,
): Promise<{ message: string }> => {
  const response = await axiosClient.post<{ message: string }>(
    "/auth/resend-phone-otp",
    payload,
  );
  return response.data;
};

export const refreshSession = async (): Promise<AuthResponse> => {
  const response = await axiosClient.post<RawAuthResponse>("/auth/refresh");
  return normalizeAuthResponse(response.data);
};

export const logoutApi = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};
