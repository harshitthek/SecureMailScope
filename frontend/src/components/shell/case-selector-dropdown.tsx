"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { EVIDENCE_CASES } from "@/lib/mock-data";

interface CaseSelectorDropdownProps {
  activeCase: EvidenceCase;
  onSelectCase: (c: EvidenceCase) => void;
}

export function CaseSelectorDropdown({
  activeCase,
  onSelectCase,
}: CaseSelectorDropdownProps) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCaseMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHardened = activeCase.posture_grade === "A+" || activeCase.posture_grade === "A";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setCaseMenuOpen(!caseMenuOpen)}
        className="h-9 px-3.5 rounded-full border border-[#2e3038] hover:border-[#777a88] bg-[#121317] hover:bg-[#1c1d22] text-[#e2e3e9] text-xs font-mono flex items-center gap-2.5 transition-colors"
        aria-expanded={caseMenuOpen}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isHardened ? "bg-[#34d399]" : "bg-[#f87171]"
          }`}
        />
        <span className="font-medium text-white">{activeCase.case_code}</span>
        <span className="text-[#5e616e] hidden md:inline">·</span>
        <span className="text-[#acafb9] hidden md:inline truncate max-w-[120px]">
          {activeCase.name}
        </span>
        <span
          className={`px-2 py-0.2 rounded-full text-[11px] border font-medium ${
            isHardened
              ? "text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10"
              : "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10"
          }`}
        >
          {activeCase.posture_score}/100
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#777a88]" strokeWidth={1.8} />
      </button>

      {caseMenuOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-[10px] border border-[#2e3038] bg-[#040406] shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#9194a1] border-b border-[#1c1d22] flex items-center justify-between font-mono">
            <span>Forensic Case Dossiers</span>
            <span className="text-[#cc9166]">4 Preset Captures</span>
          </div>
          <div className="divide-y divide-[#1c1d22] mt-1">
            {EVIDENCE_CASES.map((c) => {
              const isSelected = c.id === activeCase.id;
              const cIsHardened = c.posture_grade === "A+" || c.posture_grade === "A";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelectCase(c);
                    setCaseMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-[8px] flex items-center justify-between hover:bg-[#121317] transition-colors ${
                    isSelected ? "bg-[#121317] border border-[#2e3038]" : ""
                  }`}
                >
                  <div className="flex flex-col gap-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs text-white">
                        {c.case_code} · {c.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                          cIsHardened
                            ? "text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10"
                            : "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10"
                        }`}
                      >
                        {c.posture_score}/100 ({c.posture_grade})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9194a1] line-clamp-1">
                      {c.description}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#cc9166] shrink-0 ml-2" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
