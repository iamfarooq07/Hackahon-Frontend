"use client";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  accent?: "blue" | "emerald" | "amber" | "violet" | "rose";
}

const accentMap = {
  blue: {
    card: "border-slate-700/50 hover:border-blue-500/30",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  emerald: {
    card: "border-slate-700/50 hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  amber: {
    card: "border-slate-700/50 hover:border-amber-500/30",
    iconBg: "bg-amber-500/20 text-amber-400",
  },
  violet: {
    card: "border-slate-700/50 hover:border-violet-500/30",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  rose: {
    card: "border-slate-700/50 hover:border-rose-500/30",
    iconBg: "bg-rose-500/20 text-rose-400",
  },
};

export default function StatCard({ label, value, icon, accent = "blue" }: StatCardProps) {
  const styles = accentMap[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-slate-800/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${styles.card}`}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
