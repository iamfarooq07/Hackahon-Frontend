"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionsApi, patientsApi } from "@/services/api";
import type { Medicine } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

export default function PrescriptionsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => prescriptionsApi.list(),
  });

  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: prescriptionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setShowAdd(false);
    },
  });

  const prescriptions = data?.prescriptions ?? [];
  const patients = patientsData?.patients ?? [];

  const handleDownloadPdf = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    const url = `${base}/prescriptions/${id}/pdf`;
    try {
      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `prescription-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Download failed.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Add Prescription
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((pr) => {
              const patient = typeof pr.patientId === "object" ? pr.patientId : undefined;
              const doctor = typeof pr.doctorId === "object" ? pr.doctorId : undefined;
              return (
                <div
                  key={pr._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {patient?.name ?? (pr.patientId as string)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {doctor?.name} · {pr.createdAt && new Date(pr.createdAt).toLocaleDateString()}
                      </p>
                      <ul className="mt-2 text-sm text-slate-300">
                        {pr.medicines.map((m, i) => (
                          <li key={i}>
                            {m.name} — {m.dosage}, {m.frequency}
                          </li>
                        ))}
                      </ul>
                      {pr.instructions && (
                        <p className="mt-2 text-sm text-slate-500">{pr.instructions}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(pr._id)}
                      className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })}
            {prescriptions.length === 0 && (
              <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-500">
                No prescriptions yet.
              </p>
            )}
          </div>
        )}

        {showAdd && (
          <AddPrescriptionModal
            patients={patients}
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

function AddPrescriptionModal({
  patients,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  patients: { _id: string; name: string }[];
  onClose: () => void;
  onSubmit: (data: { patientId: string; medicines: Medicine[]; instructions?: string }) => void;
  loading: boolean;
  error: unknown;
}) {
  const [patientId, setPatientId] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "" },
  ]);
  const [instructions, setInstructions] = useState("");

  const addMedicine = () => {
    setMedicines((m) => [...m, { name: "", dosage: "", frequency: "" }]);
  };

  const updateMedicine = (i: number, field: keyof Medicine, value: string) => {
    setMedicines((m) => {
      const next = [...m];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeMedicine = (i: number) => {
    setMedicines((m) => m.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = medicines.filter((m) => m.name && m.dosage && m.frequency);
    if (valid.length === 0) return;
    onSubmit({ patientId, medicines: valid, instructions: instructions || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Add Prescription</h2>
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-2 text-sm text-red-400">
            {String(error)}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-400">Medicines</label>
              <button
                type="button"
                onClick={addMedicine}
                className="text-sm text-blue-400 hover:underline"
              >
                + Add
              </button>
            </div>
            {medicines.map((m, i) => (
              <div key={i} className="mt-2 flex gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-2">
                <input
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) => updateMedicine(i, "name", e.target.value)}
                  className="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-white"
                />
                <input
                  placeholder="Dosage"
                  value={m.dosage}
                  onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                  className="w-24 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-white"
                />
                <input
                  placeholder="Frequency"
                  value={m.frequency}
                  onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                  className="w-28 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-white"
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(i)}
                  className="text-red-400 hover:underline"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-slate-400">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
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
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
