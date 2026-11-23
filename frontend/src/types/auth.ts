export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface SignInPayload {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
}

export interface SignUpPayload {
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  message: string;
  phoneNumber: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otp: string;
}

export interface ResendOtpPayload {
  phoneNumber: string;
}
