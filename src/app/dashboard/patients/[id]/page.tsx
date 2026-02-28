"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patientsApi } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-history", id],
    queryFn: () => patientsApi.getHistory(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]}>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          Failed to load patient.
        </div>
      </ProtectedRoute>
    );
  }

  const { patient, appointments, prescriptions, diagnosisLogs } = data;

  return (
    <ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/patients"
            className="text-slate-400 hover:text-white"
          >
            ← Patients
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
          <p className="text-slate-400">
            Age {patient.age} · {patient.gender} · {patient.contact}
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Appointments</h2>
          <div className="space-y-2">
            {appointments.length === 0 ? (
              <p className="text-slate-500">No appointments.</p>
            ) : (
              appointments.map((a: { _id: string; date: string; status: string; doctorId?: { name: string } }) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3"
                >
                  <span className="text-white">
                    {new Date(a.date).toLocaleString()} · {typeof a.doctorId === "object" && a.doctorId?.name}
                  </span>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Prescriptions</h2>
          <div className="space-y-2">
            {prescriptions.length === 0 ? (
              <p className="text-slate-500">No prescriptions.</p>
            ) : (
              prescriptions.map((pr: { _id: string; createdAt?: string; medicines?: { name: string }[] }) => (
                <div
                  key={pr._id}
                  className="rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3"
                >
                  <p className="text-slate-400 text-sm">
                    {pr.createdAt && new Date(pr.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-white">
                    {pr.medicines?.map((m: { name: string }) => m.name).join(", ")}
                  </p>
                  <Link
                    href={`/dashboard/prescriptions?id=${pr._id}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Diagnosis Logs</h2>
          <div className="space-y-2">
            {diagnosisLogs.length === 0 ? (
              <p className="text-slate-500">No diagnosis logs.</p>
            ) : (
              diagnosisLogs.map((log: { _id: string; symptoms: string; riskLevel: string; createdAt?: string }) => (
                <div
                  key={log._id}
                  className="rounded-lg border border-slate-800 bg-slate-800/30 px-4 py-3"
                >
                  <p className="text-slate-400 text-sm">
                    {log.createdAt && new Date(log.createdAt).toLocaleString()} · Risk: {log.riskLevel}
                  </p>
                  <p className="text-white">{log.symptoms}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
