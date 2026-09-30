import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  badge,
}: StatCardProps) {
  return (
    <div className="relative flex flex-col justify-between p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-slate-50">
          {value}
        </span>
        {badge && <div>{badge}</div>}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{subtitle}</p>
      )}
    </div>
  );
}
