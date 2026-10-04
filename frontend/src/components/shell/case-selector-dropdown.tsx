"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Trash2 } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { EVIDENCE_CASES, MOCK_RESULT } from "@/lib/mock-data";
import { listStoredCases, deleteStoredCase } from "@/lib/api";

interface CaseSelectorDropdownProps {
  activeCase: EvidenceCase;
  onSelectCase: (c: EvidenceCase) => void;
}

type StoredCaseItem = Partial<EvidenceCase> & { id: string; filename?: string };

const PRESET_CODES = new Set(["CASE-01", "CASE-02", "CASE-03", "CASE-04"]);

export function CaseSelectorDropdown({ activeCase, onSelectCase }: CaseSelectorDropdownProps) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const [caseList, setCaseList] = useState<EvidenceCase[]>(EVIDENCE_CASES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCases = async () => {
    try {
      const resp = await listStoredCases();
      const rawCases = resp.cases || resp;
      if (Array.isArray(rawCases)) {
        const custom: EvidenceCase[] = rawCases
          .filter((item: StoredCaseItem) => !PRESET_CODES.has(item.case_code || ""))
          .map((item: StoredCaseItem) => ({
            id: item.id,
            case_code: item.case_code || "USER-CAP",
            name: item.name || item.filename || "STORED CAPTURE",
            label: `[${item.case_code || "CUSTOM"}]`,
            target_host: item.target_host || "Forensic Target",
            protocol: item.protocol || "EMAIL",
            severity: item.severity || "medium",
            packet_count: item.packet_count ?? 0,
            stream_count: item.stream_count ?? 0,
            posture_score: item.posture_score ?? 50,
            posture_grade: item.posture_grade || "C",
            bpf_filter: item.bpf_filter || "tcp and (port 25 or 587 or 465 or 993 or 110)",
            description: item.description || "Database stored forensic session",
            data: item.data || {
              ...MOCK_RESULT,
              analysis_id: item.id,
              filename: item.filename || "stored.pcap",
              enterprise_score: item.posture_score ?? 50,
              enterprise_grade: item.posture_grade || "C",
              total_packets: item.packet_count ?? 0,
              total_sessions: item.stream_count ?? 0,
            },
          }));
        setCaseList([...EVIDENCE_CASES, ...custom]);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCases();
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCaseMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteStoredCase(id);
      setCaseList((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const isHardened = activeCase.posture_grade === "A+" || activeCase.posture_grade === "A";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setCaseMenuOpen(!caseMenuOpen)}
        className="h-9 px-3.5 rounded-full border border-[#2e3038] hover:border-[#777a88] bg-[#121317] hover:bg-[#1c1d22] text-[#e2e3e9] text-xs font-mono flex items-center gap-2.5 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${isHardened ? "bg-[#34d399]" : "bg-[#f87171]"}`} />
        <span className="font-medium text-white">{activeCase.case_code}</span>
        <span className="text-[#5e616e] hidden md:inline">·</span>
        <span className="text-[#acafb9] hidden md:inline truncate max-w-[120px]">{activeCase.name}</span>
        <span className={`px-2 py-0.2 rounded-full text-[11px] border font-medium ${isHardened ? "text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10" : "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10"}`}>
          {activeCase.posture_score}/100
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#777a88]" />
      </button>

      {caseMenuOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-[10px] border border-[#2e3038] bg-[#040406] shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#9194a1] border-b border-[#1c1d22] flex items-center justify-between font-mono">
            <span>Forensic Case Dossiers</span>
            <span className="text-[#cc9166]">{caseList.length} Active Captures</span>
          </div>
          <div className="divide-y divide-[#1c1d22] mt-1">
            {caseList.map((c) => {
              const isSelected = c.id === activeCase.id || c.case_code === activeCase.case_code;
              const isPreset = PRESET_CODES.has(c.case_code);
              return (
                <div key={c.id} className={`w-full px-3 py-2 rounded-[8px] flex items-center justify-between hover:bg-[#121317] transition-colors cursor-pointer ${isSelected ? "bg-[#121317] border border-[#2e3038]" : ""}`} onClick={() => { onSelectCase(c); setCaseMenuOpen(false); }}>
                  <div className="flex flex-col gap-0.5 pr-2 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs text-white truncate">{c.case_code} · {c.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-[#2e3038] text-[#cc9166]">{c.posture_score}/100</span>
                    </div>
                    <span className="text-[11px] text-[#9194a1] line-clamp-1">{c.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isPreset && (
                      <button type="button" onClick={(e) => handleDelete(e, c.id)} className="p-1 text-[#777a88] hover:text-rose-400 transition-colors" title="Delete custom case">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-[#cc9166]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
