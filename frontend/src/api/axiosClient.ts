import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const rawURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const baseURL = String(rawURL).trim().replace(/^['"]|['"]$/g, "");

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config)
      return Promise.reject(error);
    const config = error.config as RetryConfig;
    const url = config.url ?? "";
    if (
      error.response?.status !== 401 ||
      config._retry ||
      /\/auth\/(login|refresh|logout)/.test(url)
    )
      return Promise.reject(error);
    config._retry = true;
    try {
      refreshPromise ??= refreshClient
        .post("/auth/refresh")
        .then(({ data }) => {
          const store = useAuthStore.getState();
          const userRaw = data?.user;
          const user = {
            id: userRaw?.id || userRaw?._id || "",
            fullName: userRaw?.fullName || userRaw?.name || "",
            email: userRaw?.email || "",
            phoneNumber: userRaw?.phoneNumber || "",
            avatarUrl: userRaw?.avatarUrl ?? userRaw?.avatar ?? null,
            role: userRaw?.role || "user",
          };
          const token = (data?.accessToken as string) || "";
          store.setAuth(user, token);
          return token;
        })
        .finally(() => {
          refreshPromise = null;
        });
      const accessToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${accessToken}`;
      return axiosClient(config);
    } catch (refreshError) {
      // Khi refresh token thất bại, chỉ reset state client mà không gọi lặp thêm network request
      useAuthStore.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
