import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/types/auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const axiosClient = axios.create({ baseURL, timeout: 10000, withCredentials: true, headers: { "Content-Type": "application/json" } });
const refreshClient = axios.create({ baseURL, timeout: 10000, withCredentials: true, headers: { "Content-Type": "application/json" } });
let refreshPromise: Promise<string> | null = null;
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use((response) => response, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config) return Promise.reject(error);
  const config = error.config as RetryConfig;
  const url = config.url ?? "";
  if (error.response?.status !== 401 || config._retry || /\/auth\/(login|refresh|logout)/.test(url)) return Promise.reject(error);
  config._retry = true;
  try {
    refreshPromise ??= refreshClient.post<AuthResponse>("/auth/refresh").then(({ data }) => {
      useAuthStore.getState().setSession(data);
      return data.accessToken;
    }).finally(() => { refreshPromise = null; });
    const accessToken = await refreshPromise;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return axiosClient(config);
  } catch (refreshError) {
    useAuthStore.getState().clearSession();
    return Promise.reject(refreshError);
  }
});

export default axiosClient;
