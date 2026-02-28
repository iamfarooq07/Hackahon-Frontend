import api from "@/lib/api";

export type UserRole = "admin" | "doctor" | "receptionist" | "patient";
export type SubscriptionPlan = "free" | "pro";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  subscriptionPlan?: SubscriptionPlan;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (data: RegisterInput) =>
    api
      .post<AuthResponse>("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        subscriptionPlan: data.subscriptionPlan,
      })
      .then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  me: () => api.get<MeResponse>("/auth/me").then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>("/auth/refresh", { refreshToken }).then((r) => r.data),
};
