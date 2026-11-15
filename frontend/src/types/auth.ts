export type UserRole = "user" | "admin" | "seller";
export interface AuthUser { id: string; name: string; email: string; phoneNumber: string; role: UserRole }
export interface SignInPayload { phoneNumber: string; password: string }
export interface AuthResponse { message: string; user: AuthUser; accessToken: string }
