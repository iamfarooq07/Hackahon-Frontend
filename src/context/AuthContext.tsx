"use client";

import { createContext, useContext, ReactNode } from "react";
import { useMe, useLogin, useRegister, useLogout } from "@/api/queries";
import type { User, RegisterInput } from "@/api/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User } | void>;
  register: (data: RegisterInput) => Promise<{ user: User } | void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
  const meQuery = useMe(hasToken);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const user = meQuery.data?.user ?? null;
  const loading = hasToken && meQuery.isLoading;

  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    return data;
  };

  const register = async (data: Parameters<typeof registerMutation.mutateAsync>[0]) => {
    const res = await registerMutation.mutateAsync(data);
    return res;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
