"use client";

import { useState } from "react";
import { ComplianceCheck } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, FileCheck } from "lucide-react";

interface ComplianceChecklistProps {
  compliance: ComplianceCheck[];
}

export function ComplianceChecklist({ compliance }: ComplianceChecklistProps) {
  const [filter, setFilter] = useState<"all" | "fail" | "pass">("all");

  const getStatusIcon = (status: "pass" | "fail" | "warn") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case "warn":
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case "fail":
      default:
        return <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
    }
  };

  const passCount = compliance.filter((c) => c.status === "pass").length;
  const failCount = compliance.filter((c) => c.status === "fail").length;

  const filtered = compliance.filter((item) => {
    if (filter === "pass") return item.status === "pass";
    if (filter === "fail") return item.status === "fail";
    return true;
  });

  return (
    <div className="flex flex-col h-full rounded-xl border border-soc-border bg-soc-card shadow-tactical-sm p-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-soc-border/60 gap-2">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            NIST SP 800-52r2 & RFC Compliance Matrix
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Automated statutory cryptographic standard enforcement audit
          </p>
        </div>

        <div className="flex items-center gap-1 bg-soc-bg p-1 rounded-lg border border-soc-border text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              filter === "all" ? "bg-soc-border text-slate-200" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            ALL ({compliance.length})
          </button>
          <button
            onClick={() => setFilter("fail")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              filter === "fail" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "text-slate-500 hover:text-rose-400"
            }`}
          >
            FAILED ({failCount})
          </button>
          <button
            onClick={() => setFilter("pass")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              filter === "pass" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-500 hover:text-emerald-400"
            }`}
          >
            PASSED ({passCount})
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto max-h-[380px] pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2.5 p-3 rounded-lg border border-soc-border bg-soc-bg/80 hover:border-soc-borderHighlight transition-colors"
          >
            <div className="mt-0.5">{getStatusIcon(item.status)}</div>
            <div className="flex-1 min-w-0 font-mono">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-slate-100 truncate">
                  {item.standard} {item.section}
                </span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                    item.status === "pass"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : item.status === "warn"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300 font-sans leading-snug">
                {item.requirement}
              </p>
              {item.details && (
                <p className="mt-1.5 text-[10px] text-slate-400 truncate border-t border-soc-border/40 pt-1 font-mono">
                  Evidence: {item.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
