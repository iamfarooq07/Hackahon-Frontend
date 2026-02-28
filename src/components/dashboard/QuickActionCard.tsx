"use client";

import Link from "next/link";

interface QuickActionCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent?: "blue" | "emerald" | "violet";
}

const accentBorder = {
  blue: "hover:border-blue-500/50 hover:shadow-blue-500/10",
  emerald: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
  violet: "hover:border-violet-500/50 hover:shadow-violet-500/10",
};

export default function QuickActionCard({
  href,
  icon,
  title,
  description,
  accent = "blue",
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${accentBorder[accent]}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-700/50 text-3xl transition-colors group-hover:bg-blue-500/20">
        {icon}
      </div>
      <h3 className="font-semibold text-white group-hover:text-blue-400">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
        Open →
      </span>
    </Link>
  );
}
