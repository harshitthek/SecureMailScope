"use client";

import React from "react";
import { Shield, UploadCloud, FileText } from "lucide-react";
import { EvidenceCase } from "@/lib/types";
import { getReportUrl } from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";
import { ExportMenu } from "./export-menu";
import { CaseSelectorDropdown } from "./case-selector-dropdown";

interface ApplicationHeaderProps {
  activeCase: EvidenceCase;
  onSelectCase: (c: EvidenceCase) => void;
  onOpenUpload: () => void;
}

export function ApplicationHeader({
  activeCase,
  onSelectCase,
  onOpenUpload,
}: ApplicationHeaderProps) {
  const handleDirectPdfDownload = () => {
    const url = getReportUrl(activeCase.data.analysis_id, "pdf");
    window.open(url, "_blank");
  };

  return (
    <header className="w-full bg-[#08080a] border-b border-[#1c1d22] sticky top-0 z-40 select-none">
      <div className="max-w-[1216px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* LEFT: Brand Lockup with Copper Eyebrow */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] flex items-center justify-center text-[#cc9166] shrink-0">
            <Shield className="w-4 h-4" strokeWidth={1.75} />
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.01em] text-white font-normal">
              SecureMailScope
            </span>
            <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase hidden sm:inline">
              NTRO · SIH26159
            </span>
          </div>
        </div>

        {/* CENTER: Case Selector Pill */}
        <CaseSelectorDropdown activeCase={activeCase} onSelectCase={onSelectCase} />

        {/* RIGHT: Ghost Outline + White Primary Action Button */}
        <div className="flex items-center gap-2.5">
          {/* Ghost Outline PDF Button */}
          <button
            type="button"
            onClick={handleDirectPdfDownload}
            title="Download Forensic Audit Dossier (PDF)"
            className="hidden sm:flex h-9 px-4 rounded-full border border-white hover:bg-white/10 text-white font-medium text-xs font-sans items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#cc9166]" strokeWidth={2} />
            <span>Export PDF</span>
          </button>

          <ExportMenu analysisId={activeCase.data.analysis_id} />

          {/* Single Primary Action Button in Viewport (White Pill, Black Text) */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="h-9 px-4 rounded-full bg-white hover:bg-[#e2e3e9] text-black font-medium text-xs font-sans flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-black" strokeWidth={2} />
            <span>Upload PCAP</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
