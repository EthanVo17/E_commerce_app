export interface SignInPayload {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}
