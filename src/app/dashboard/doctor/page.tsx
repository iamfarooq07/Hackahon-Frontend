"use client";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PageHeader from "@/components/dashboard/PageHeader";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", "doctor"],
    queryFn: () => analyticsApi.doctor(),
  });
  const monthlyQuery = useQuery({
    queryKey: ["analytics", "monthly-doctor"],
    queryFn: () => analyticsApi.monthlyAppointments(),
  });

  const chartData =
    monthlyQuery.data?.data?.map((d: { _id: { year: number; month: number }; count: number }) => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
      count: d.count,
    })) || [];

  const firstName = user?.name?.trim().split(" ")[0] || user?.email?.split("@")[0] || "Doctor";

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, Dr. ${firstName}`}
        subtitle="Your practice at a glance"
      />

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          Failed to load stats.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Today's Appointments"
          value={data?.dailyAppointments ?? 0}
          icon="📅"
          accent="blue"
        />
        <StatCard
          label="Prescriptions Issued"
          value={data?.prescriptionCount ?? 0}
          icon="📋"
          accent="emerald"
        />
        <StatCard
          label="Monthly Completed"
          value={data?.monthlyStats?.completed ?? 0}
          icon="✅"
          accent="violet"
        />
      </div>

      <ChartCard title="Monthly Appointments" isEmpty={chartData.length === 0}>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
