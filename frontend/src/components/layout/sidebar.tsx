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
  FolderOpen,
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

interface NavSection {
  title: string;
  items: {
    id: NavView;
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[];
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

  const sections: NavSection[] = [
    {
      title: "CASEBOARD",
      items: [
        {
          id: "OVERVIEW",
          label: "Case Overview",
          sublabel: "Posture & Threat Field",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "INVESTIGATE",
      items: [
        {
          id: "SESSIONS",
          label: "Network Flows",
          sublabel: "Reconstructed Streams",
          icon: Network,
          badge: sessionCount,
          badgeColor: "text-phosphor-green border-phosphor-green/40",
        },
        {
          id: "FINDINGS",
          label: "Threat Findings",
          sublabel: "NIST & CVE Vulnerabilities",
          icon: ShieldAlert,
          badge: findingCount,
          badgeColor: "text-phosphor-hazard border-phosphor-hazard/40",
        },
        {
          id: "CERTIFICATES",
          label: "Certificates",
          sublabel: "X.509 Assurance Ledger",
          icon: KeyRound,
          badge: certCount,
          badgeColor: "text-phosphor-cyan border-phosphor-cyan/40",
        },
      ],
    },
    {
      title: "FORENSICS",
      items: [
        {
          id: "DISSECTOR",
          label: "Deep Dissector",
          sublabel: "Handshake & Wire Inspector",
          icon: Binary,
        },
        {
          id: "STANDARDS",
          label: "Standards Matrix",
          sublabel: "NIST SP 800-52r2 Checklist",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "OUTPUT",
      items: [
        {
          id: "REPORTS",
          label: "Forensic Report",
          sublabel: "PDF & JSON Evidentiary Export",
          icon: FileText,
        },
      ],
    },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const activeCaseObj = cases.find((c) => c.id === activeCaseId) || cases[0];

  return (
    <aside className="w-64 min-w-[256px] max-w-[264px] bg-tactical-surface border-r border-tactical-border flex flex-col justify-between font-mono text-xs select-none h-full z-20 overflow-y-auto">
      {/* Top Header & Identity */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-4 py-3 border-b border-tactical-border bg-black/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 border border-phosphor-cyan/50 bg-phosphor-cyan/10 flex items-center justify-center text-phosphor-cyan flex-shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-sans font-black tracking-wider text-white block truncate uppercase">
                SECUREMAILSCOPE
              </span>
              <span className="text-[10px] text-tactical-dim block tracking-wide font-mono">
                SIH26159 // PASSIVE SOC
              </span>
            </div>
          </div>
        </div>

        {/* Active Case Badge */}
        {activeCaseObj && (
          <div className="p-3 border-b border-tactical-border bg-tactical-elevated/40">
            <div className="flex items-center justify-between text-[10px] text-tactical-dim mb-1">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <FolderOpen className="w-3 h-3 text-phosphor-cyan" />
                ACTIVE CASE
              </span>
              <span
                className={`font-black px-1.5 py-0.2 border ${
                  activeCaseObj.posture_score < 50
                    ? "border-phosphor-hazard bg-phosphor-hazard/15 text-phosphor-hazard"
                    : "border-phosphor-green bg-phosphor-green/15 text-phosphor-green"
                }`}
              >
                {activeCaseObj.posture_grade} ({activeCaseObj.posture_score})
              </span>
            </div>
            <div className="text-white font-sans font-bold text-xs truncate">
              {activeCaseObj.name}
            </div>
            <div className="text-[10px] text-tactical-dim flex items-center justify-between mt-1">
              <span>{activeCaseObj.stream_count} STREAMS</span>
              <span>PORT 25, 587, 465, 143, 993</span>
            </div>
          </div>
        )}

        {/* Navigation Sections with Lit Rails */}
        <div className="py-2 space-y-4">
          {sections.map((sec) => (
            <div key={sec.title} className="px-2">
              <div className="text-[9px] uppercase tracking-widest text-tactical-dim/80 px-3 py-1 font-bold">
                {sec.title}
              </div>
              <nav className="space-y-0.5 mt-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 transition-all text-left relative ${
                        isActive
                          ? "border-l-2 border-phosphor-cyan bg-gradient-to-r from-phosphor-cyan/15 to-transparent text-white font-bold shadow-[inset_2px_0_8px_rgba(0,216,246,0.25)]"
                          : "border-l-2 border-transparent text-tactical-dim hover:text-white hover:bg-tactical-surfaceHover"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isActive ? "text-phosphor-cyan" : "text-tactical-dim"
                          }`}
                        />
                        <div className="min-w-0">
                          <span className="text-xs block tracking-wide truncate">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Badge if present */}
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] tabular-nums font-bold px-1.5 py-0.2 border bg-black/60 ${
                            item.badgeColor || "text-tactical-text border-tactical-border"
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
          ))}
        </div>

        {/* Case Queue Selector */}
        <div className="p-2 border-t border-tactical-border">
          <div className="flex items-center justify-between px-2.5 py-1 mb-1">
            <span className="text-[9px] uppercase tracking-widest text-tactical-dim font-bold">
              CASE EVIDENCE QUEUE ({cases.length})
            </span>
            <Database className="w-2.5 h-2.5 text-phosphor-cyan" />
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = c.id === activeCaseId;
              const isCrit = c.posture_score < 50 || c.posture_grade === "F";
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`w-full text-left p-1.5 border transition-all text-xs ${
                    isSelected
                      ? "border-phosphor-cyan bg-tactical-elevated text-white font-bold"
                      : "border-tactical-border/70 bg-black/30 text-tactical-dim hover:border-tactical-borderHighlight hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] truncate max-w-[130px]">
                      {c.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1 py-0.2 border ${
                        isCrit
                          ? "border-phosphor-hazard/50 bg-phosphor-hazard/10 text-phosphor-hazard"
                          : "border-phosphor-green/50 bg-phosphor-green/10 text-phosphor-green"
                      }`}
                    >
                      {c.posture_grade} ({c.posture_score})
                    </span>
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
            className="border border-dashed border-tactical-border hover:border-phosphor-cyan/70 bg-black/40 hover:bg-tactical-surfaceHover p-2.5 text-center cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-center gap-1.5 text-phosphor-cyan text-xs font-bold uppercase">
              <Upload className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? "ANALYZING..." : "[+] INGEST PCAP"}</span>
            </div>
            <p className="text-[9px] text-tactical-dim mt-0.5">
              Drop wire capture .pcap / pcapng
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Footer Status */}
      <div className="p-3 border-t border-tactical-border bg-black/60 text-[9px] text-tactical-dim space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span>FORENSIC SENSOR:</span>
          <span className="text-phosphor-green font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-phosphor-green rounded-full animate-pulse" />
            SYNCHRONIZED
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>EVALUATION:</span>
          <span className="text-white font-bold">NTRO SIH26159</span>
        </div>
      </div>
    </aside>
  );
}
