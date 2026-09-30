import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  indicatorColor?: string;
  tag?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  badge,
  indicatorColor = "#0ea5e9",
  tag,
}: StatCardProps) {
  return (
    <div className="relative flex flex-col justify-between h-full p-4 rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm transition-all hover:border-soc-borderHighlight hover:bg-soc-cardHover overflow-hidden group">
      {/* Top accent indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-75 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: indicatorColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-soc-border/50">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {tag && (
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded bg-soc-border text-slate-400">
              {tag}
            </span>
          )}
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-soc-border/50 border border-soc-border text-slate-300 group-hover:text-cyan-400 transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-auto py-3 flex items-baseline justify-between gap-2">
        <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-slate-50">
          {value}
        </span>
        {badge && <div>{badge}</div>}
      </div>

      {/* Subtitle Telemetry */}
      {subtitle && (
        <div className="pt-2 border-t border-soc-border/50 text-[11px] text-slate-400 font-mono truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}
