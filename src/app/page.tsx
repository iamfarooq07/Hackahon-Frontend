"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7 } },
  };

  return (
    <main className="relative min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      
      {/* --- Section 1: Hero Section --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center p-6">
        
        {/* Floating Animated Background (Medical Blue Theme) */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" 
          />
        </div>

        {/* Hero Content */}
        <motion.div 
          className="z-10 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h1 variants={itemVariants} className="mb-6 text-5xl font-extrabold tracking-tight md:text-8xl">
            Smart <span className="text-blue-500">Clinic</span> <br />
            Management
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-lg text-slate-400 md:text-xl">
            Streamline patient records, appointments, and billing with our 
            all-in-one digital healthcare solution.
          </motion.p>
        </motion.div>

        {/* --- Floating Bottom-Right Buttons --- */}
        <div className="fixed bottom-10 right-10 z-50 flex gap-4">
          {user ? (
            <Link href="/dashboard" className="rounded-full bg-blue-600 px-8 py-4 font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 font-bold backdrop-blur-md hover:bg-slate-800 transition-all active:scale-95">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95">
                Register Clinic
              </Link>
            </>
          )}
        </div>
      </section>

      {/* --- Section 2: Features Section --- */}
      <section className="relative z-10 bg-slate-950/50 py-24 px-6 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-12 md:grid-cols-3"
          >
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-8 transition-colors hover:border-blue-500/50">
              <div className="mb-4 text-3xl text-blue-500">📅</div>
              <h3 className="mb-2 text-xl font-bold">Easy Scheduling</h3>
              <p className="text-slate-400 text-sm">Automated appointment booking and reminders for your patients.</p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-8 transition-colors hover:border-blue-500/50">
              <div className="mb-4 text-3xl text-blue-500">📁</div>
              <h3 className="mb-2 text-xl font-bold">Digital EMR</h3>
              <p className="text-slate-400 text-sm">Securely store and access patient history and prescriptions 24/7.</p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-8 transition-colors hover:border-blue-500/50">
              <div className="mb-4 text-3xl text-blue-500">💳</div>
              <h3 className="mb-2 text-xl font-bold">Billing & Invoicing</h3>
              <p className="text-slate-400 text-sm">Generate professional invoices and manage clinic finances instantly.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Decor */}
      <footer className="py-10 text-center text-slate-600 text-xs tracking-widest uppercase">
        © 2026 ClinicManage AI • All Rights Reserved
      </footer>
    </main>
  );
}