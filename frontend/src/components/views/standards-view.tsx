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
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none font-sans">
      {/* Header & Stats Card */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1c1d22] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Compliance Benchmark
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
                Cryptographic Standards &amp; Baseline Compliance
              </h2>
              <p className="text-xs text-[#9194a1] mt-0.5">
                Audit assessment against NIST SP 800-52r2 and IETF RFC 8314 requirements
              </p>
            </div>
          </div>

          {/* Standards Filter Pills */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono-tech">
            {standardsList.map((std) => {
              const isSelected = selectedStandard === std;
              return (
                <button
                  key={std}
                  type="button"
                  onClick={() => setSelectedStandard(std)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all ${
                    isSelected
                      ? "bg-white text-black border-white font-semibold shadow-xs"
                      : "bg-[#121317] text-[#9194a1] border-[#1c1d22] hover:text-white hover:border-[#2e3038]"
                  }`}
                >
                  {std === "ALL" ? "All Standards" : std}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-5 font-mono-tech">
          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#10b981] uppercase tracking-wider block">
              Requirements Passed
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {passCount}
            </span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#f87171] uppercase tracking-wider block">
              Violations / Failed
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {failCount}
            </span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#fbbf24] uppercase tracking-wider block">
              Warnings
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
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
              className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-5 hover:border-[#2e3038] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c1d22] gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-1.5 rounded-full shrink-0 border ${
                      isPass
                        ? "bg-[#064e3b]/20 text-[#10b981] border-[#10b981]/40"
                        : isFail
                        ? "bg-[#7f1d1d]/20 text-[#f87171] border-[#f87171]/40"
                        : "bg-[#78350f]/20 text-[#fbbf24] border-[#fbbf24]/40"
                    }`}
                  >
                    {isPass ? <CheckCircle2 className="w-4 h-4" /> : isFail ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </span>

                  <div>
                    <h3 className="font-serif font-normal text-base text-white">
                      {item.requirement}
                    </h3>
                    <span className="text-xs font-mono-tech text-[#9194a1]">
                      {item.standard} · Section {item.section}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono-tech font-semibold uppercase tracking-wider self-start sm:self-auto ${
                    isPass
                      ? "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/40"
                      : isFail
                      ? "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/40"
                      : "bg-[#78350f]/20 text-[#fbbf24] border border-[#fbbf24]/40"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="pt-3 text-xs font-mono-tech text-[#e2e3e9] leading-relaxed">
                <strong className="text-[#cc9166] font-semibold">Observed Wire Evaluation: </strong>
                {item.details}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
