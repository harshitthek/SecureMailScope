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
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 mb-4">
      <div className="bg-sms-surface-secondary/60 border border-sms-border rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs font-mono-tech select-none">
        {/* Primary Case Metadata Chips */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
          {/* File Name */}
          <div className="flex items-center gap-1.5 text-sms-text-primary font-bold bg-sms-surface-primary px-2.5 py-1 rounded-lg border border-sms-border shadow-xs">
            <FileCode className="w-3.5 h-3.5 text-sky-500 shrink-0" strokeWidth={2} />
            <span>{activeCase.data.filename}</span>
          </div>

          {/* Packets */}
          <div className="flex items-center gap-1.5 text-sms-text-secondary">
            <Layers className="w-3.5 h-3.5 text-sms-text-muted shrink-0" />
            <span>
              <strong className="text-sms-text-primary font-bold">
                {activeCase.data.total_packets.toLocaleString()}
              </strong>{" "}
              Packets
            </span>
          </div>

          <span className="text-sms-border-strong hidden sm:inline">•</span>

          {/* Streams */}
          <div className="flex items-center gap-1.5 text-sms-text-secondary">
            <span>
              <strong className="text-sms-text-primary font-bold">
                {activeCase.data.total_sessions}
              </strong>{" "}
              Reconstructed Streams
            </span>
          </div>

          <span className="text-sms-border-strong hidden md:inline">•</span>

          {/* Hash */}
          <div className="hidden md:flex items-center gap-1.5 text-sms-text-muted">
            <Hash className="w-3.5 h-3.5 text-sms-text-muted shrink-0" />
            <span>SHA-256: {shortHash}</span>
          </div>

          <span className="text-sms-border-strong hidden xl:inline">•</span>

          {/* Time */}
          <div className="hidden xl:flex items-center gap-1.5 text-sms-text-muted">
            <Clock className="w-3.5 h-3.5 text-sms-text-muted shrink-0" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Capture Scope Popover */}
        <div className="relative ml-auto" ref={scopeRef}>
          <button
            type="button"
            onClick={() => setScopeOpen(!scopeOpen)}
            className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all duration-150 shadow-xs ${
              scopeOpen
                ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                : "border-sms-border hover:border-sms-border-strong bg-sms-surface-primary text-sms-text-secondary hover:text-sms-text-primary"
            }`}
            aria-expanded={scopeOpen}
          >
            <Filter className="w-3.5 h-3.5 text-sky-500" strokeWidth={2} />
            <span>Capture Parameters</span>
            <ChevronDown
              className={`w-3 h-3 text-sms-text-muted transition-transform duration-150 ${scopeOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>

          {scopeOpen && (
            <div className="absolute right-0 mt-2 w-[460px] rounded-2xl border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 p-5 font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-sms-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="font-bold text-sm text-sms-text-primary">
                    Forensic Capture Parameters
                  </span>
                </div>
                <span className="text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20">
                  VERIFIED SCOPE
                </span>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                <div>
                  <span className="font-mono-tech text-sms-text-muted uppercase font-semibold block mb-1">
                    BPF Kernel Filter Expression
                  </span>
                  <code className="text-xs font-mono-tech block bg-sms-surface-secondary p-2.5 rounded-lg border border-sms-border text-sky-600 dark:text-sky-400 break-all select-all font-semibold">
                    {activeCase.bpf_filter || "tcp and (port 25 or 587 or 465 or 993 or 110)"}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-sms-surface-secondary/50 p-2.5 rounded-lg border border-sms-border">
                    <span className="font-mono-tech text-sms-text-muted uppercase text-[10px] block font-semibold">
                      Protocol Scope
                    </span>
                    <span className="font-mono-tech font-bold text-sms-text-primary block mt-0.5">
                      {activeCase.data.protocols_detected.join(", ") || "SMTP, SMTPS, IMAP, IMAPS"}
                    </span>
                  </div>

                  <div className="bg-sms-surface-secondary/50 p-2.5 rounded-lg border border-sms-border">
                    <span className="font-mono-tech text-sms-text-muted uppercase text-[10px] block font-semibold">
                      Sensor Tap Interface
                    </span>
                    <span className="font-mono-tech font-bold text-sms-text-primary block mt-0.5">
                      eth0 (Passive Mirror Tap)
                    </span>
                  </div>

                  <div className="bg-sms-surface-secondary/50 p-2.5 rounded-lg border border-sms-border">
                    <span className="font-mono-tech text-sms-text-muted uppercase text-[10px] block font-semibold">
                      Raw Payload Size
                    </span>
                    <span className="font-mono-tech font-bold text-sms-text-primary block mt-0.5">
                      {(activeCase.data.file_size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="bg-sms-surface-secondary/50 p-2.5 rounded-lg border border-sms-border">
                    <span className="font-mono-tech text-sms-text-muted uppercase text-[10px] block font-semibold">
                      Processing Latency
                    </span>
                    <span className="font-mono-tech font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {activeCase.data.processing_time_ms} ms
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-sms-border">
                  <span className="font-mono-tech text-sms-text-muted uppercase text-[10px] block font-semibold">
                    SHA-256 PCAP Image Digest
                  </span>
                  <span className="text-[11px] font-mono-tech text-sms-text-secondary block mt-0.5 select-all break-all bg-sms-surface-secondary p-1.5 rounded border border-sms-border">
                    7f8a9e4b2d1c60a8e5f32190db4a78103c5e8821ad5b4142f1a6ce72901bca
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
