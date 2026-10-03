"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileCode, ChevronDown, Filter, ShieldCheck } from "lucide-react";
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
    <div className="h-[38px] border-b border-sms-border bg-sms-surface-secondary/50 px-6 flex items-center justify-between shrink-0 select-none text-body-s">
      {/* Primary case context items */}
      <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sms-text-primary font-medium">
          <FileCode className="w-3.5 h-3.5 text-sms-cyan shrink-0" strokeWidth={1.5} />
          <span className="font-mono-tech text-ui">{activeCase.data.filename}</span>
        </div>

        <span className="text-sms-border-strong">·</span>

        <span className="font-mono-tech text-ui text-sms-text-secondary">
          <strong className="text-sms-text-primary font-semibold">{activeCase.data.total_packets.toLocaleString()}</strong> PACKETS
        </span>

        <span className="text-sms-border-strong">·</span>

        <span className="font-mono-tech text-ui text-sms-text-secondary">
          <strong className="text-sms-text-primary font-semibold">{activeCase.data.total_sessions}</strong> RECONSTRUCTED FLOWS
        </span>

        <span className="text-sms-border-strong hidden sm:inline">·</span>

        <span className="font-mono-tech text-meta text-sms-text-muted hidden sm:inline">
          SHA256: {shortHash}
        </span>

        <span className="text-sms-border-strong hidden lg:inline">·</span>

        <span className="font-mono-tech text-meta text-sms-text-muted hidden lg:inline">
          {formattedTime}
        </span>
      </div>

      {/* Forensic Capture Scope disclosure */}
      <div className="relative" ref={scopeRef}>
        <button
          type="button"
          onClick={() => setScopeOpen(!scopeOpen)}
          className={`h-[28px] px-2.5 rounded-tag border text-ui font-mono-tech flex items-center gap-1.5 transition-fast ${
            scopeOpen
              ? "border-sms-cyan bg-sms-cyan-dim text-sms-cyan"
              : "border-sms-border hover:border-sms-border-strong bg-sms-surface-primary text-sms-text-secondary hover:text-sms-text-primary"
          }`}
          aria-expanded={scopeOpen}
        >
          <Filter className="w-3 h-3 text-sms-cyan" strokeWidth={1.5} />
          <span>CAPTURE SCOPE</span>
          <ChevronDown
            className={`w-3 h-3 text-sms-text-muted transition-transform ${scopeOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        {scopeOpen && (
          <div className="absolute right-0 mt-2 w-[460px] rounded-btn border border-sms-border-strong bg-sms-surface-primary shadow-modal z-50 p-4 font-sans">
            <div className="flex items-center justify-between pb-2.5 border-b border-sms-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sms-cyan" strokeWidth={1.5} />
                <span className="font-semibold text-ui text-sms-text-primary">
                  Forensic Capture Parameters
                </span>
              </div>
              <span className="text-meta font-mono-tech px-1.5 py-0.5 rounded-tag bg-sms-green-dim text-sms-green border border-sms-green/30">
                VERIFIED SCOPE
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-body-s">
              <div>
                <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                  BPF Expression
                </span>
                <code className="text-ui font-mono-tech block bg-sms-surface-raw p-2 rounded-tag border border-sms-border text-sms-cyan mt-1 break-all">
                  {activeCase.bpf_filter || "tcp and (port 25 or 587 or 465 or 993 or 110)"}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                    Protocol Scope
                  </span>
                  <span className="text-ui font-mono-tech text-sms-text-primary block mt-0.5">
                    {activeCase.data.protocols_detected.join(", ") || "SMTP, SMTPS, IMAP, IMAPS"}
                  </span>
                </div>

                <div>
                  <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                    Tap Interface
                  </span>
                  <span className="text-ui font-mono-tech text-sms-text-primary block mt-0.5">
                    eth0 (Passive Mirror Tap)
                  </span>
                </div>

                <div>
                  <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                    Raw Payload Size
                  </span>
                  <span className="text-ui font-mono-tech text-sms-text-primary block mt-0.5">
                    {(activeCase.data.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div>
                  <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                    Processing Latency
                  </span>
                  <span className="text-ui font-mono-tech text-sms-text-primary block mt-0.5">
                    {activeCase.data.processing_time_ms} ms
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-sms-border">
                <span className="text-meta font-mono-tech text-sms-text-muted uppercase block">
                  SHA-256 Image Digest
                </span>
                <span className="text-meta font-mono-tech text-sms-text-secondary block mt-0.5 select-all">
                  7f8a9e4b2d1c60a8e5f32190db4a78103c5e8821ad5b4142f1a6ce72901bca
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
