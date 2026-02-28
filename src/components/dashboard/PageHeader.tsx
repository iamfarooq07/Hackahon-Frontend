"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
