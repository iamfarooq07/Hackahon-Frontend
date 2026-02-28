/**
 * Clinic API service – patients, appointments, prescriptions, diagnosis, analytics.
 */

import api from "@/lib/api";

// ----- Patients -----
export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
}

export const patientsApi = {
  list: () => api.get<{ patients: Patient[] }>("/patients").then((r) => r.data),
  get: (id: string) => api.get<{ patient: Patient }>(`/patients/${id}`).then((r) => r.data),
  getHistory: (id: string) =>
    api.get<{ patient: Patient; appointments: unknown[]; prescriptions: unknown[]; diagnosisLogs: unknown[] }>(`/patients/${id}/history`).then((r) => r.data),
  create: (data: Omit<Patient, "_id" | "createdBy" | "createdAt">) =>
    api.post<{ patient: Patient }>("/patients", data).then((r) => r.data),
  update: (id: string, data: Partial<Patient>) =>
    api.patch<{ patient: Patient }>(`/patients/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/patients/${id}`).then((r) => r.data),
};

// ----- Appointments -----
export interface Appointment {
  _id: string;
  patientId: Patient | string;
  doctorId: { _id: string; name: string; email: string } | string;
  date: string;
  status: string;
  createdAt?: string;
}

export const appointmentsApi = {
  list: (params?: { doctorId?: string; patientId?: string; status?: string; from?: string; to?: string }) =>
    api.get<{ appointments: Appointment[] }>("/appointments", { params }).then((r) => r.data),
  get: (id: string) => api.get<{ appointment: Appointment }>(`/appointments/${id}`).then((r) => r.data),
  create: (data: { patientId: string; doctorId: string; date: string; status?: string }) =>
    api.post<{ appointment: Appointment }>("/appointments", data).then((r) => r.data),
  update: (id: string, data: Partial<Appointment>) =>
    api.patch<{ appointment: Appointment }>(`/appointments/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/appointments/${id}`).then((r) => r.data),
};

// ----- Prescriptions -----
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  _id: string;
  patientId: Patient | string;
  doctorId: { _id: string; name: string; email: string } | string;
  medicines: Medicine[];
  instructions?: string;
  pdfUrl?: string | null;
  createdAt?: string;
}

export const prescriptionsApi = {
  list: (params?: { patientId?: string; doctorId?: string }) =>
    api.get<{ prescriptions: Prescription[] }>("/prescriptions", { params }).then((r) => r.data),
  get: (id: string) => api.get<{ prescription: Prescription }>(`/prescriptions/${id}`).then((r) => r.data),
  create: (data: { patientId: string; medicines: Medicine[]; instructions?: string }) =>
    api.post<{ prescription: Prescription }>("/prescriptions", data).then((r) => r.data),
  getPdfUrl: (id: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    return `${base}/prescriptions/${id}/pdf`;
  },
};

// ----- Diagnosis / AI -----
export const diagnosisApi = {
  aiStatus: () =>
    api.get<{ aiConfigured: boolean }>("/diagnosis/ai-status").then((r) => r.data),
  symptomCheck: (data: { patientId?: string; symptoms: string; age?: number; gender?: string; history?: string }) =>
    api.post<{ possibleConditions: string[]; riskLevel: string; suggestedTests: string[]; raw?: string; aiUsed?: boolean; provider?: string }>("/diagnosis/symptom-check", data).then((r) => r.data),
  prescriptionExplain: (data: { medicines: Medicine[]; instructions?: string }) =>
    api.post<{ explanation: string; lifestyleAdvice?: string; preventiveTips?: string; raw?: string; aiUsed?: boolean; provider?: string }>("/diagnosis/prescription-explain", data).then((r) => r.data),
  riskFlag: (data: { patientId?: string; summary?: string }) =>
    api.post<{ flagged: boolean; message: string; aiUsed?: boolean; provider?: string }>("/diagnosis/risk-flag", data).then((r) => r.data),
  listLogs: (patientId: string) =>
    api.get<{ logs: unknown[] }>("/diagnosis/logs", { params: { patientId } }).then((r) => r.data),
};

// ----- Analytics -----
export const analyticsApi = {
  admin: () =>
    api.get<{ totalPatients: number; totalDoctors: number; monthlyAppointments: number; simulatedRevenue: number; diagnosisByRisk: { _id: string; count: number }[] }>("/analytics/admin").then((r) => r.data),
  doctor: () =>
    api.get<{ dailyAppointments: number; monthlyStats: Record<string, number>; prescriptionCount: number }>("/analytics/doctor").then((r) => r.data),
  monthlyAppointments: () =>
    api.get<{ data: { _id: { year: number; month: number }; count: number }[] }>("/analytics/monthly-appointments").then((r) => r.data),
};

// ----- Users (for dropdowns – doctors list) -----
export interface UserOption {
  _id: string;
  name: string;
  email: string;
}
export const usersApi = {
  listDoctors: () => api.get<{ users: UserOption[] }>("/users/doctors").then((r) => r.data),
};

// Prescription PDF download: use token in header; backend returns blob
export function getPrescriptionPdfLink(id: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/prescriptions/${id}/pdf`;
}
