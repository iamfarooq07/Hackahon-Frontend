"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PageHeader from "@/components/dashboard/PageHeader";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: () => analyticsApi.admin(),
  });

  const monthlyQuery = useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: () => analyticsApi.monthlyAppointments(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Failed to load analytics.
      </div>
    );
  }

  const pieData =
    data.diagnosisByRisk?.map((d: { _id: string; count: number }, i: number) => ({
      name: d._id || "unknown",
      value: d.count,
      color: COLORS[i % COLORS.length],
    })) || [];
  const chartData =
    monthlyQuery.data?.data?.map((d: { _id: { year: number; month: number }; count: number }) => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
      count: d.count,
    })) || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Clinic overview and analytics"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Patients" value={data.totalPatients} icon="👥" accent="blue" />
        <StatCard label="Total Doctors" value={data.totalDoctors} icon="🩺" accent="emerald" />
        <StatCard
          label="Monthly Appointments"
          value={data.monthlyAppointments}
          icon="📅"
          accent="violet"
        />
        <StatCard
          label="Simulated Revenue"
          value={`$${data.simulatedRevenue}`}
          icon="💰"
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard
          title="Diagnosis by Risk Level"
          emptyMessage="No diagnosis data yet"
          isEmpty={pieData.length === 0}
        >
          {pieData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
