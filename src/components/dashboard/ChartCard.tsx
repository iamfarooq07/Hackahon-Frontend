"use client";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function ChartCard({
  title,
  children,
  emptyMessage = "No data yet",
  isEmpty = false,
}: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="h-64">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-slate-800/30 text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
