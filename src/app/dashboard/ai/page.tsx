"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { diagnosisApi, patientsApi } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader from "@/components/dashboard/PageHeader";
import { useAuth } from "@/context/AuthContext";

function AiBadge({ aiUsed, provider }: { aiUsed?: boolean; provider?: string | null }) {
  if (aiUsed && provider) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        AI · {provider === "openai" ? "OpenAI" : "Gemini"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-600/50 px-2.5 py-0.5 text-xs font-medium text-slate-400">
      Fallback
    </span>
  );
}

export default function AIToolsPage() {
  const { user } = useAuth();
  const isPro = user?.subscriptionPlan === "pro";

  const { data: aiStatusData } = useQuery({
    queryKey: ["diagnosis", "ai-status"],
    queryFn: () => diagnosisApi.aiStatus(),
    enabled: isPro,
  });

  const aiConfigured = aiStatusData?.aiConfigured ?? false;

  if (!isPro) {
    return (
      <ProtectedRoute allowedRoles={["admin", "doctor"]}>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
          <h2 className="text-lg font-semibold">Pro plan required</h2>
          <p className="mt-2 text-sm">
            AI features (Symptom Checker, Prescription Explanation, Risk Flagging) are available
            on the Pro plan. Upgrade to enable.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "doctor"]}>
      <div className="space-y-8">
        <PageHeader
          title="AI Tools"
          subtitle="Smart symptom checker, prescription explanation, risk flagging"
        />

        {!aiConfigured && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-200">
            <p className="text-sm font-medium">AI not configured</p>
            <p className="mt-1 text-sm opacity-90">
              Add <code className="rounded bg-slate-800 px-1">OPENAI_API_KEY</code> or{" "}
              <code className="rounded bg-slate-800 px-1">GEMINI_API_KEY</code> to your backend{" "}
              <code className="rounded bg-slate-800 px-1">.env</code> to enable live AI. Until then, fallback advice is shown.
            </p>
          </div>
        )}

        <SymptomChecker />
        <PrescriptionExplainer />
        <RiskFlagging />
      </div>
    </ProtectedRoute>
  );
}

function SymptomChecker() {
  const [patientId, setPatientId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [history, setHistory] = useState("");
  const [result, setResult] = useState<{
    possibleConditions?: string[];
    riskLevel?: string;
    suggestedTests?: string[];
    raw?: string;
    aiUsed?: boolean;
    provider?: string | null;
  } | null>(null);

  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });
  const patients = patientsData?.patients ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      diagnosisApi.symptomCheck({
        patientId: patientId || undefined,
        symptoms,
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        history: history || undefined,
      }),
    onSuccess: (data) => setResult(data),
  });

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Smart Symptom Checker</h2>
      <p className="mb-4 text-sm text-slate-400">
        Enter symptoms and optional patient context. AI returns possible conditions, risk level, and suggested tests (not a diagnosis).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-400">Patient (optional)</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          >
            <option value="">— None —</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400">Age (optional)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400">Gender (optional)</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          >
            <option value="">— Select —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm text-slate-400">Symptoms *</label>
        <textarea
          required
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          placeholder="e.g. headache, fever, fatigue"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm text-slate-400">Brief history (optional)</label>
        <input
          type="text"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !symptoms.trim()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-70"
      >
        {mutation.isPending ? "Analyzing..." : "Analyze"}
      </button>
      {mutation.error && (
        <p className="mt-2 text-sm text-red-400">{String(mutation.error)}</p>
      )}
      {result && (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AiBadge aiUsed={result.aiUsed} provider={result.provider} />
            <p className="text-sm font-medium text-slate-300">
              Risk level: <span className="text-white">{result.riskLevel}</span>
            </p>
          </div>
          {result.possibleConditions && result.possibleConditions.length > 0 && (
            <>
              <p className="text-sm text-slate-400">Possible conditions (suggestions only):</p>
              <ul className="list-inside list-disc text-sm text-slate-300">
                {result.possibleConditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
          {result.suggestedTests && result.suggestedTests.length > 0 && (
            <>
              <p className="mt-2 text-sm text-slate-400">Suggested tests:</p>
              <ul className="list-inside list-disc text-sm text-slate-300">
                {result.suggestedTests.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PrescriptionExplainer() {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "" }]);
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState<{
    explanation?: string;
    aiUsed?: boolean;
    provider?: string | null;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      diagnosisApi.prescriptionExplain({
        medicines: medicines.filter((m) => m.name),
        instructions,
      }),
    onSuccess: (data) => setResult(data),
  });

  const addRow = () => setMedicines((m) => [...m, { name: "", dosage: "", frequency: "" }]);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Prescription Explanation</h2>
      <p className="mb-4 text-sm text-slate-400">
        Get a simple explanation and lifestyle/prevention tips for a set of medicines.
      </p>
      {medicines.map((m, i) => (
        <div key={i} className="mb-2 flex gap-2">
          <input
            placeholder="Medicine name"
            value={m.name}
            onChange={(e) =>
              setMedicines((prev) => {
                const n = [...prev];
                n[i] = { ...n[i], name: e.target.value };
                return n;
              })
            }
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
          <input
            placeholder="Dosage"
            value={m.dosage}
            onChange={(e) =>
              setMedicines((prev) => {
                const n = [...prev];
                n[i] = { ...n[i], dosage: e.target.value };
                return n;
              })
            }
            className="w-28 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
          <input
            placeholder="Frequency"
            value={m.frequency}
            onChange={(e) =>
              setMedicines((prev) => {
                const n = [...prev];
                n[i] = { ...n[i], frequency: e.target.value };
                return n;
              })
            }
            className="w-28 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="mb-4 text-sm text-blue-400 hover:underline"
      >
        + Add medicine
      </button>
      <div className="mb-4">
        <label className="block text-sm text-slate-400">Instructions (optional)</label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-70"
      >
        {mutation.isPending ? "Generating..." : "Explain"}
      </button>
      {result?.explanation && (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="mb-2">
            <AiBadge aiUsed={result.aiUsed} provider={result.provider} />
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

function RiskFlagging() {
  const [patientId, setPatientId] = useState("");
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState<{
    flagged?: boolean;
    message?: string;
    aiUsed?: boolean;
    provider?: string | null;
  } | null>(null);

  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientsApi.list(),
  });
  const patients = patientsData?.patients ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      diagnosisApi.riskFlag({
        patientId: patientId || undefined,
        summary: summary || undefined,
      }),
    onSuccess: (data) => setResult(data),
  });

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Risk Flagging</h2>
      <p className="mb-4 text-sm text-slate-400">
        Review patient history (or paste a summary). AI flags repeated infections, chronic symptoms, or high-risk combinations.
      </p>
      <div className="mb-4">
        <label className="block text-sm text-slate-400">Patient (optional – uses recent logs)</label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        >
          <option value="">— None —</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-slate-400">Or paste history summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
        />
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-70"
      >
        {mutation.isPending ? "Checking..." : "Check risk"}
      </button>
      {result && (
        <div
          className={`mt-6 rounded-lg border p-4 ${
            result.flagged
              ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
              : "border-slate-700 bg-slate-800/50 text-slate-300"
          }`}
        >
          <div className="mb-2">
            <AiBadge aiUsed={result.aiUsed} provider={result.provider} />
          </div>
          {result.message}
        </div>
      )}
    </div>
  );
}
