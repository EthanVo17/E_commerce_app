import axiosClient from "./axiosClient";
import type { SignInPayload, AuthResponse } from "@/types/auth";

export const signIn = async (payload: SignInPayload): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>(
    "/auth/sign-in",
    payload,
  );
  return response.data;
};
