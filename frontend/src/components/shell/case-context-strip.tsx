"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileCode, ChevronDown, Filter, ShieldCheck, Clock, Hash, Layers } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface CaseContextStripProps {
  activeCase: EvidenceCase;
}

export function CaseContextStrip({ activeCase }: CaseContextStripProps) {
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setScopeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shortHash = "7f8a9e4b...d5b4";
  const formattedTime = new Date(activeCase.data.analyzed_at).toUTCString();

  return (
    <div className="w-full max-w-[1216px] mx-auto px-6 py-3">
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs font-mono select-none">
        {/* Primary Case Metadata Chips */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
          {/* File Name Pill */}
          <div className="flex items-center gap-1.5 text-white font-medium bg-[#121317] px-3 py-1 rounded-full border border-[#2e3038]">
            <FileCode className="w-3.5 h-3.5 text-[#cc9166] shrink-0" strokeWidth={1.75} />
            <span>{activeCase.data.filename}</span>
          </div>

          {/* Packets */}
          <div className="flex items-center gap-1.5 text-[#9194a1]">
            <Layers className="w-3.5 h-3.5 text-[#5e616e] shrink-0" />
            <span>
              <strong className="text-white font-medium">
                {activeCase.data.total_packets.toLocaleString()}
              </strong>{" "}
              Packets
            </span>
          </div>

          <span className="text-[#2e3038] hidden sm:inline">•</span>

          {/* Streams */}
          <div className="flex items-center gap-1.5 text-[#9194a1]">
            <span>
              <strong className="text-white font-medium">
                {activeCase.data.total_sessions}
              </strong>{" "}
              Reconstructed Streams
            </span>
          </div>

          <span className="text-[#2e3038] hidden md:inline">•</span>

          {/* Hash */}
          <div className="hidden md:flex items-center gap-1.5 text-[#777a88]">
            <Hash className="w-3.5 h-3.5 text-[#5e616e] shrink-0" />
            <span>SHA-256: {shortHash}</span>
          </div>

          <span className="text-[#2e3038] hidden xl:inline">•</span>

          {/* Time */}
          <div className="hidden xl:flex items-center gap-1.5 text-[#777a88]">
            <Clock className="w-3.5 h-3.5 text-[#5e616e] shrink-0" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Capture Scope Popover Button (Pill shaped) */}
        <div className="relative ml-auto" ref={scopeRef}>
          <button
            type="button"
            onClick={() => setScopeOpen(!scopeOpen)}
            className={`h-8 px-3.5 rounded-full border text-xs font-sans font-medium flex items-center gap-2 transition-colors ${
              scopeOpen
                ? "border-[#cc9166] bg-[#121317] text-[#cc9166]"
                : "border-[#2e3038] hover:border-[#777a88] bg-[#121317] text-[#e2e3e9]"
            }`}
            aria-expanded={scopeOpen}
          >
            <Filter className="w-3.5 h-3.5 text-[#cc9166]" strokeWidth={1.75} />
            <span>Capture Parameters</span>
            <ChevronDown
              className={`w-3 h-3 text-[#777a88] transition-transform duration-150 ${scopeOpen ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {scopeOpen && (
            <div className="absolute right-0 mt-2 w-[440px] rounded-[10px] border border-[#2e3038] bg-[#040406] shadow-2xl z-50 p-5 font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c1d22]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#cc9166]" />
                  <span className="font-serif font-normal text-sm text-white">Capture Parameters &amp; Filter</span>
                </div>
                <span className="text-[11px] font-mono text-[#cc9166] uppercase">Sensor TAP-01</span>
              </div>

              <div className="py-3 space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[#9194a1] block text-[11px] mb-1">Active BPF Filter Expression</span>
                  <div className="p-2.5 rounded-[8px] bg-[#08080a] border border-[#1c1d22] text-[#e2e3e9]">
                    {activeCase.bpf_filter}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[#9194a1] block text-[11px]">Monitored Protocols</span>
                    <span className="font-medium text-white block mt-0.5">SMTP (25/587), SMTPS (465), IMAP(S), POP3(S)</span>
                  </div>
                  <div>
                    <span className="text-[#9194a1] block text-[11px]">Audit Standards</span>
                    <span className="font-medium text-white block mt-0.5">NIST SP 800-52r2 · RFC 8314</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
