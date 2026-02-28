"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect to role-specific dashboard which already show analytics (admin/doctor).
 */
export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "admin") router.replace("/dashboard/admin");
    else if (user.role === "doctor") router.replace("/dashboard/doctor");
    else router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}
