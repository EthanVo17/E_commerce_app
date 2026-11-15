import axiosClient from "./axiosClient";
import type { SignInPayload, AuthResponse } from "@/types/auth";

export const signIn = async (payload: SignInPayload & { rememberMe: boolean }): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>(
    "/auth/login",
    payload,
  );
  return response.data;
};
