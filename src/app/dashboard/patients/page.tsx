"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/services/api";
import type { Patient } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function PatientsPage() {
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setModal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setModal(null);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: patientsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  });

  const patients = data?.patients ?? [];

  return (
    <ProtectedRoute allowedRoles={["admin", "doctor", "receptionist"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <button
            type="button"
            onClick={() => setModal("add")}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Add Patient
          </button>
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
                  <th className="p-4 font-medium text-slate-300">Name</th>
                  <th className="p-4 font-medium text-slate-300">Age</th>
                  <th className="p-4 font-medium text-slate-300">Gender</th>
                  <th className="p-4 font-medium text-slate-300">Contact</th>
                  <th className="p-4 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-b border-slate-800/50">
                    <td className="p-4 text-white">{p.name}</td>
                    <td className="p-4 text-slate-400">{p.age}</td>
                    <td className="p-4 text-slate-400">{p.gender}</td>
                    <td className="p-4 text-slate-400">{p.contact}</td>
                    <td className="p-4 flex gap-2">
                      <Link
                        href={`/dashboard/patients/${p._id}`}
                        className="text-blue-400 hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(p);
                          setModal("edit");
                        }}
                        className="text-amber-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this patient?")) deleteMutation.mutate(p._id);
                        }}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && (
              <p className="p-8 text-center text-slate-500">No patients yet.</p>
            )}
          </div>
        )}

        {modal === "add" && (
          <PatientForm
            onClose={() => setModal(null)}
            onSubmit={(d) => createMutation.mutate(d)}
            loading={createMutation.isPending}
            error={createMutation.error}
          />
        )}
        {modal === "edit" && selected && (
          <PatientForm
            initial={selected}
            onClose={() => setModal(null)}
            onSubmit={(d) => updateMutation.mutate({ id: selected._id, data: d })}
            loading={updateMutation.isPending}
            error={updateMutation.error}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function PatientForm({
  initial,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  initial?: Patient;
  onClose: () => void;
  onSubmit: (data: { name: string; age: number; gender: string; contact: string }) => void;
  loading: boolean;
  error: unknown;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "male");
  const [contact, setContact] = useState(initial?.contact ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      age: Number(age),
      gender,
      contact,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {initial ? "Edit Patient" : "Add Patient"}
        </h2>
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-2 text-sm text-red-400">
            {axios.isAxiosError(error) ? (error.response?.data?.message ?? String(error)) : String(error)}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Age</label>
            <input
              type="number"
              required
              min={0}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400">Contact</label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
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
              {loading ? "Saving..." : initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
