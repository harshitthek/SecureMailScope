"use client";

import { QuickFilter } from "@/hooks/use-workstation";

interface QuickFiltersProps {
  filter: QuickFilter;
  onFilterChange: (f: QuickFilter) => void;
}

export function QuickFilters({ filter, onFilterChange }: QuickFiltersProps) {
  const options: { id: QuickFilter; label: string }[] = [
    { id: "ALL", label: "[ ALL ]" },
    { id: "CRITICAL", label: "[ CRITICAL ]" },
    { id: "HARDENED", label: "[ HARDENED ]" },
  ];

  return (
    <div className="font-mono text-xs space-y-1">
      <span className="text-[9px] uppercase tracking-wider text-tactical-dim block">
        QUEUE FILTER
      </span>
      <div className="grid grid-cols-3 gap-1">
        {options.map((opt) => {
          const isActive = filter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`py-1 px-1.5 text-[10px] uppercase font-bold border transition-colors text-center ${
                isActive
                  ? "border-phosphor-cyan bg-phosphor-cyan/15 text-phosphor-cyan"
                  : "border-tactical-border bg-tactical-surface text-tactical-dim hover:text-white hover:border-tactical-highlight"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
