"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, patientsApi, usersApi } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsApi.list(),
  });

  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => usersApi.listDoctors(),
  });

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowAdd(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string } }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const appointments = data?.appointments ?? [];
  const patients = patientsData?.patients ?? [];
  const doctors = doctorsData?.users ?? [];
  const isDoctor = user?.role === "doctor";

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          {(user?.role === "admin" || user?.role === "receptionist" || user?.role === "doctor") && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
            >
              Book Appointment
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50">
                <tr>
                  <th className="p-4 font-medium text-slate-300">Patient</th>
                  <th className="p-4 font-medium text-slate-300">Doctor</th>
                  <th className="p-4 font-medium text-slate-300">Date</th>
                  <th className="p-4 font-medium text-slate-300">Status</th>
                  {!isDoctor && (
                    <th className="p-4 font-medium text-slate-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => {
                  const patient = typeof a.patientId === "object" ? a.patientId : undefined;
                  const doctor = typeof a.doctorId === "object" ? a.doctorId : undefined;
                  return (
                    <tr key={a._id} className="border-b border-slate-800/50">
                      <td className="p-4 text-white">
                        {patient?.name ?? (a.patientId as string)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {doctor?.name ?? (a.doctorId as string)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(a.date).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            a.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : a.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      {!isDoctor && (
                        <td className="p-4">
                          {a.status === "pending" || a.status === "confirmed" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: a._id,
                                    data: { status: "completed" },
                                  })
                                }
                                className="mr-2 text-green-400 hover:underline"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: a._id,
                                    data: { status: "cancelled" },
                                  })
                                }
                                className="text-red-400 hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <p className="p-8 text-center text-slate-500">No appointments.</p>
            )}
          </div>
        )}

        {showAdd && (
          <AddAppointmentModal
            patients={patients}
            doctors={doctors}
            defaultDoctorId={user?.role === "doctor" ? user.id : undefined}
            onClose={() => setShowAdd(false)}
            onSubmit={(d) => createMutation.mutate(d)}
            loading={createMutation.isPending}
            error={createMutation.error}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function AddAppointmentModal({
  patients,
  doctors,
  defaultDoctorId,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  patients: { _id: string; name: string }[];
  doctors: { _id: string; name: string }[];
  defaultDoctorId?: string;
  onClose: () => void;
  onSubmit: (data: { patientId: string; doctorId: string; date: string; status?: string }) => void;
  loading: boolean;
  error: Error | null;
}) {
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(defaultDoctorId ?? "");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (defaultDoctorId && !doctorId) setDoctorId(defaultDoctorId);
  }, [defaultDoctorId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Book Appointment</h2>
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-2 text-sm text-red-400">
            {error.message}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ patientId, doctorId, date, status });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-slate-400">Patient</label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Select</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400">Doctor</label>
            <select
              required
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">Select</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-70"
            >
              {loading ? "Booking..." : "Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}