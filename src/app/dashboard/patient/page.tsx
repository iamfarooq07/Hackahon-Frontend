"use client";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/dashboard/PageHeader";
import QuickActionCard from "@/components/dashboard/QuickActionCard";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const name = user?.name?.trim() || "Patient";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${name}`}
        subtitle="View your appointments and prescriptions"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <QuickActionCard
          href="/dashboard/appointments"
          icon="📅"
          title="My Appointments"
          description="View and manage your appointments"
          accent="blue"
        />
      </div>
    </div>
  );
}
