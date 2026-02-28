"use client";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/dashboard/PageHeader";
import QuickActionCard from "@/components/dashboard/QuickActionCard";

export default function ReceptionistDashboardPage() {
  const { user } = useAuth();
  const name = user?.name?.trim() || "Receptionist";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${name}`}
        subtitle="Manage patients and appointments"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          href="/dashboard/patients"
          icon="👥"
          title="Patients"
          description="Add and manage patient records"
          accent="blue"
        />
        <QuickActionCard
          href="/dashboard/appointments"
          icon="📅"
          title="Appointments"
          description="Book and update appointments"
          accent="emerald"
        />
      </div>
    </div>
  );
}
