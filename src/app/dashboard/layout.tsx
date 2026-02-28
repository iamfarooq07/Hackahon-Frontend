"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { UserRole } from "@/api/auth";

const roleNav: Record<
  UserRole,
  { label: string; path: string; icon: string }[]
> = {
  admin: [
    { label: "Overview", path: "/dashboard/admin", icon: "◉" },
    { label: "Patients", path: "/dashboard/patients", icon: "👥" },
    { label: "Appointments", path: "/dashboard/appointments", icon: "📅" },
    { label: "Prescriptions", path: "/dashboard/prescriptions", icon: "📋" },
    { label: "AI Tools", path: "/dashboard/ai", icon: "◇" },
    { label: "Analytics", path: "/dashboard/analytics", icon: "▣" },
  ],
  doctor: [
    { label: "Overview", path: "/dashboard/doctor", icon: "◉" },
    { label: "Patients", path: "/dashboard/patients", icon: "👥" },
    { label: "Appointments", path: "/dashboard/appointments", icon: "📅" },
    { label: "Prescriptions", path: "/dashboard/prescriptions", icon: "📋" },
    { label: "AI Tools", path: "/dashboard/ai", icon: "◇" },
    { label: "Analytics", path: "/dashboard/analytics", icon: "▣" },
  ],
  receptionist: [
    { label: "Overview", path: "/dashboard/receptionist", icon: "◉" },
    { label: "Patients", path: "/dashboard/patients", icon: "👥" },
    { label: "Appointments", path: "/dashboard/appointments", icon: "📅" },
  ],
  patient: [
    { label: "Overview", path: "/dashboard/patient", icon: "◉" },
    { label: "My Appointments", path: "/dashboard/appointments", icon: "📅" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role ?? "patient";
  const nav = roleNav[role] || roleNav.patient;

  const initial = user?.name?.trim().charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-900/95 shadow-xl backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4 md:justify-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <span className="text-lg">🩺</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Clinic <span className="text-blue-400">AI</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 shadow-inner"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg opacity-90">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-sm font-bold text-blue-400">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              <span className="mt-0.5 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-400">
                {role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout().then(() => router.push("/login"))}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <span className="text-xl">☰</span>
          </button>
          <p className="text-sm text-slate-500 md:block">
            {role} dashboard
          </p>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
