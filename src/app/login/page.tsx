"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      const path = data?.user?.role ? `/dashboard/${data.user.role}` : "/dashboard";
      router.push(path);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid credentials");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-4 text-slate-200">
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500 text-2xl">🏥</div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-400">Login to your clinic dashboard</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 border border-red-500/20">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              {/* FIXED LINE BELOW: Added className */}
              <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
              <Link href="#" className="text-xs text-blue-500 hover:underline">Forgot?</Link>
            </div>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          New clinic? <Link href="/register" className="font-semibold text-blue-500 hover:text-blue-400">Register now</Link>
        </p>
      </motion.div>
    </main>
  );
}