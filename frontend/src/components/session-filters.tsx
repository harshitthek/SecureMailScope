"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";

interface SessionFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedProtocol: string;
  onProtocolChange: (proto: string) => void;
  selectedSeverity: string;
  onSeverityChange: (sev: string) => void;
  sortByScore: boolean;
  onToggleSort: () => void;
  protocols: string[];
}

export function SessionFilters({
  searchTerm,
  onSearchChange,
  selectedProtocol,
  onProtocolChange,
  selectedSeverity,
  onSeverityChange,
  sortByScore,
  onToggleSort,
  protocols,
}: SessionFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-soc-bg/80 border-b border-soc-border">
      {/* Search Input */}
      <div className="relative w-full lg:w-72">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter host, IP, or cipher..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-soc-border bg-soc-card text-xs font-mono text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Risk Filter */}
        <div className="flex items-center gap-1 bg-soc-card p-1 rounded-lg border border-soc-border text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase px-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Risk:
          </span>
          {["ALL", "CRITICAL", "SECURE"].map((sev) => {
            const isActive = selectedSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => onSeverityChange(sev)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all font-bold ${
                  isActive
                    ? sev === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : sev === "SECURE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Protocol Filter */}
        <div className="flex items-center gap-1 bg-soc-card p-1 rounded-lg border border-soc-border text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase px-1.5">Proto:</span>
          {["ALL", ...protocols].map((proto) => {
            const isActive = selectedProtocol === proto;
            return (
              <button
                key={proto}
                onClick={() => onProtocolChange(proto)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all font-bold ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {proto}
              </button>
            );
          })}
        </div>

        {/* Sort Button */}
        <button
          onClick={onToggleSort}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
            sortByScore
              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold"
              : "bg-soc-card border-soc-border text-slate-400 hover:text-slate-200"
          }`}
          title="Sort by posture score"
        >
          <ArrowUpDown className="w-3 h-3 text-cyan-400" />
          <span>{sortByScore ? "SCORE (WORST FIRST)" : "DEFAULT ORDER"}</span>
        </button>
      </div>
    </div>
  );
}
