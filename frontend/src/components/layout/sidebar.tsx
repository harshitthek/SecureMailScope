"use client";

import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  KeyRound,
  Binary,
  FileCheck,
  FileText,
  Upload,
  Database,
  Radio,
} from "lucide-react";
import { NavView } from "@/hooks/use-workstation";
import { EvidenceCase } from "@/lib/types";
import { useRef } from "react";

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  cases: EvidenceCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
  sessionCount: number;
  findingCount: number;
  certCount: number;
  isAnalyzing: boolean;
  onFileUpload: (file: File) => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  cases,
  activeCaseId,
  onSelectCase,
  sessionCount,
  findingCount,
  certCount,
  isAnalyzing,
  onFileUpload,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems: {
    id: NavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: "OVERVIEW", label: "OVERVIEW", icon: LayoutDashboard },
    { id: "SESSIONS", label: "SESSIONS", icon: Network, badge: sessionCount, badgeColor: "text-phosphor-green" },
    { id: "FINDINGS", label: "FINDINGS", icon: ShieldAlert, badge: findingCount, badgeColor: "text-phosphor-hazard" },
    { id: "CERTIFICATES", label: "CERTIFICATES", icon: KeyRound, badge: certCount, badgeColor: "text-phosphor-cyan" },
    { id: "DISSECTOR", label: "DISSECTOR", icon: Binary },
    { id: "STANDARDS", label: "STANDARDS", icon: FileCheck },
    { id: "REPORTS", label: "REPORTS", icon: FileText },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-64 min-w-[256px] max-w-[260px] bg-tactical-surface border-r border-tactical-border flex flex-col justify-between font-mono text-xs select-none h-full z-20">
      {/* Brand & Identity */}
      <div className="flex flex-col">
        <div className="px-4 py-3.5 border-b border-tactical-border bg-black/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 border border-phosphor-cyan/40 bg-phosphor-cyan/10 flex items-center justify-center text-phosphor-cyan flex-shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-sans font-extrabold tracking-wider text-white block truncate uppercase">
                SECUREMAILSCOPE
              </span>
              <span className="text-[10px] text-tactical-dim block tracking-wide font-mono">
                SIH26159 // PASSIVE SOC
              </span>
            </div>
          </div>
        </div>

        {/* Primary View Navigation */}
        <div className="p-2 border-b border-tactical-border">
          <div className="text-[10px] uppercase tracking-wider text-tactical-dim px-2.5 py-1 mb-1 font-bold">
            FORENSIC WORKSPACES
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all border-l-2 text-left ${
                    isActive
                      ? "bg-tactical-elevated border-phosphor-cyan text-white font-bold shadow-[inset_1px_0_0_#00d8f6]"
                      : "border-transparent text-tactical-dim hover:text-white hover:bg-tactical-surfaceHover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-phosphor-cyan" : "text-tactical-dim"}`} />
                    <span className="text-xs tracking-wide">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] tabular-nums font-bold px-1.5 py-0.2 border border-tactical-border bg-black/60 ${
                        item.badgeColor || "text-tactical-text"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Evidence Case Dossiers */}
        <div className="p-2 border-b border-tactical-border">
          <div className="flex items-center justify-between px-2.5 py-1 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-tactical-dim font-bold">
              EVIDENCE DOSSIERS ({cases.length})
            </span>
            <span className="text-[10px] text-tactical-dim flex items-center gap-1 font-mono">
              <Database className="w-2.5 h-2.5 text-phosphor-cyan" />
              QUEUE
            </span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = c.id === activeCaseId;
              const isCritical = c.posture_score < 50 || c.posture_grade === "F";
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`w-full text-left p-2 border transition-all text-xs ${
                    isSelected
                      ? "border-phosphor-cyan bg-tactical-elevated text-white font-bold"
                      : "border-tactical-border/70 bg-black/30 text-tactical-dim hover:border-tactical-borderHighlight hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-[11px] tracking-tight truncate max-w-[130px]">
                      {c.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1 py-0.2 border ${
                        isCritical
                          ? "border-phosphor-hazard/50 bg-phosphor-hazard/10 text-phosphor-hazard"
                          : "border-phosphor-green/50 bg-phosphor-green/10 text-phosphor-green"
                      }`}
                    >
                      {c.posture_grade} ({c.posture_score})
                    </span>
                  </div>
                  <div className="text-[10px] text-tactical-dim truncate font-mono">
                    {c.target_host} • {c.stream_count} streams
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Ingestion Drop-Strip */}
        <div className="p-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pcap,.pcapng,.cap"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-tactical-border hover:border-phosphor-cyan/70 bg-black/30 hover:bg-tactical-surfaceHover p-2.5 text-center cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-center gap-1.5 text-phosphor-cyan text-xs font-bold uppercase">
              <Upload className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? "INGESTING..." : "[+] INGEST PCAP"}</span>
            </div>
            <p className="text-[10px] text-tactical-dim mt-0.5">
              Drop wire capture .pcap
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-tactical-border bg-black/50 text-[10px] text-tactical-dim space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider">TAP STATUS:</span>
          <span className="text-phosphor-green font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-phosphor-green animate-pulse" />
            SYNCHRONIZED
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span>EVALUATION:</span>
          <span className="text-tactical-text font-bold">NTRO SIH26159</span>
        </div>
      </div>
    </aside>
  );
}
