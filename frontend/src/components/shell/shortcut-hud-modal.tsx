"use client";

import React, { useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { ShellNavTab } from "./nav-strip";

interface ShortcutHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ShellNavTab) => void;
  onOpenUpload: () => void;
  onExportPdf: () => void;
  onExportHtml?: () => void;
  onExportJson: () => void;
}

export function ShortcutHudModal({
  isOpen,
  onClose,
  onSelectTab,
  onOpenUpload,
  onExportPdf,
  onExportHtml,
  onExportJson,
}: ShortcutHudModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-[10px] border border-[#2e3038] bg-[#040406] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c1d22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block font-mono">
                Workstation Hotkeys // SOC Telemetry
              </span>
              <h2 className="text-xl font-serif font-normal text-white tracking-[0.01em]">
                Keyboard Shortcuts &amp; Command Palette
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full border border-[#2e3038] text-[#9194a1] hover:text-white hover:bg-[#121317] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs font-mono">
          {/* Column 1: Navigation Tabs */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777a88] block">
              Direct Deck Navigation
            </span>
            <div className="space-y-1.5">
              {[
                { key: "1", label: "Overview Posture Deck", tab: "OVERVIEW" as ShellNavTab },
                { key: "2", label: "Reconstructed Flows Ledger", tab: "FLOWS" as ShellNavTab },
                { key: "3", label: "Vulnerability Findings", tab: "FINDINGS" as ShellNavTab },
                { key: "4", label: "X.509 Certificate Tree", tab: "CERTIFICATES" as ShellNavTab },
                { key: "5", label: "Wire Protocol Dissector", tab: "DISSECTOR" as ShellNavTab },
                { key: "6", label: "Defense Standards Matrix", tab: "STANDARDS" as ShellNavTab },
                { key: "7", label: "Remediation & D3FEND", tab: "REMEDIATION" as ShellNavTab },
                { key: "8", label: "Archival Report Dossier", tab: "REPORT" as ShellNavTab },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.tab);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22] hover:border-[#cc9166]/40 hover:bg-[#121317] text-left transition-colors group"
                >
                  <span className="text-[#e2e3e9] group-hover:text-white font-sans">{item.label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    {item.key}
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Tactical Actions & BPF */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777a88] block mb-2">
                Workstation Commands
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22]">
                  <span className="text-[#e2e3e9] font-sans">Focus Stream Search</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    /
                  </kbd>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22] hover:border-[#cc9166]/40 hover:bg-[#121317] text-left transition-colors group"
                >
                  <span className="text-[#e2e3e9] group-hover:text-white font-sans">Ingest PCAP Evidence</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    U
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExportPdf();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22] hover:border-[#cc9166]/40 hover:bg-[#121317] text-left transition-colors group"
                >
                  <span className="text-[#e2e3e9] group-hover:text-white font-sans">Export PDF Dossier</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    D
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onExportHtml) onExportHtml();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22] hover:border-[#cc9166]/40 hover:bg-[#121317] text-left transition-colors group"
                >
                  <span className="text-[#e2e3e9] group-hover:text-white font-sans">Export HTML Dossier</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    H
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExportJson();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22] hover:border-[#cc9166]/40 hover:bg-[#121317] text-left transition-colors group"
                >
                  <span className="text-[#e2e3e9] group-hover:text-white font-sans">Export JSON Report</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    J
                  </kbd>
                </button>
                <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22]">
                  <span className="text-[#e2e3e9] font-sans">Toggle Shortcuts HUD</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#cc9166] text-[11px] font-semibold">
                    ?
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#08080a] border border-[#1c1d22]">
                  <span className="text-[#e2e3e9] font-sans">Dismiss / Close Modal</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#121317] border border-[#2e3038] text-[#9194a1] text-[11px] font-semibold">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            {/* BPF Filter Reference Card */}
            <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
              <span className="text-[10px] text-[#777a88] uppercase block mb-1">
                Active Forensic BPF Syntax
              </span>
              <code className="text-[11px] text-[#cc9166] block break-all font-mono">
                tcp and (port 25 or 587 or 465 or 993 or 110)
              </code>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-[#1c1d22] flex items-center justify-between text-[11px] text-[#777a88] font-mono">
          <span>NTRO SECUREMAILSCOPE // SIH26159</span>
          <span>Press [Esc] to exit</span>
        </div>
      </div>
    </div>
  );
}
