"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface StandardsViewProps {
  activeCase: EvidenceCase;
}

export function StandardsView({ activeCase }: StandardsViewProps) {
  const [selectedStandard, setSelectedStandard] = useState<string>("ALL");

  const compliance = activeCase.data.compliance;

  const standardsList = useMemo(() => {
    const set = new Set(compliance.map((c) => c.standard));
    return ["ALL", ...Array.from(set)];
  }, [compliance]);

  const filtered = useMemo(() => {
    if (selectedStandard === "ALL") return compliance;
    return compliance.filter((c) => c.standard === selectedStandard);
  }, [compliance, selectedStandard]);

  const passCount = compliance.filter((c) => c.status === "pass").length;
  const failCount = compliance.filter((c) => c.status === "fail").length;
  const warnCount = compliance.filter((c) => c.status === "warn").length;

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6 pb-16 select-none font-sans">
      {/* Header & Stats Card */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-sms-border gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
                Cryptographic Standards &amp; Baseline Compliance
              </h2>
              <p className="text-xs text-sms-text-muted mt-0.5">
                Audit assessment against NIST SP 800-52r2 and IETF RFC 8314 requirements
              </p>
            </div>
          </div>

          {/* Standards Filter */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            {standardsList.map((std) => (
              <button
                key={std}
                type="button"
                onClick={() => setSelectedStandard(std)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  selectedStandard === std
                    ? "bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40 shadow-xs"
                    : "bg-sms-surface-secondary text-sms-text-secondary border-sms-border hover:bg-sms-surface-hover"
                }`}
              >
                {std === "ALL" ? "All Standards" : std}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-5 font-mono-tech">
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Requirements Passed
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {passCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-center sm:text-left">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
              Violations / Failed
            </span>
            <span className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {failCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-center sm:text-left">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Warnings
            </span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {warnCount}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Checklist Cards */}
      <div className="space-y-3.5">
        {filtered.map((item) => {
          const isPass = item.status === "pass";
          const isFail = item.status === "fail";

          return (
            <div
              key={item.id}
              className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-smooth"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sms-border gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isPass
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : isFail
                        ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    {isPass ? <CheckCircle2 className="w-4 h-4" /> : isFail ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </span>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-sms-text-primary">
                      {item.requirement}
                    </h3>
                    <span className="text-xs font-mono-tech text-sms-text-muted">
                      {item.standard} · Section {item.section}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase tracking-wider self-start sm:self-auto ${
                    isPass
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : isFail
                      ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="pt-3 text-xs font-mono-tech text-sms-text-secondary leading-relaxed">
                <strong className="text-sms-text-primary font-bold">Observed Wire Evaluation: </strong>
                {item.details}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
