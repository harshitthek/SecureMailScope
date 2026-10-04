"use client";

import React from "react";
import { 
  Activity, 
  LayoutDashboard, 
  Layers, 
  ShieldAlert, 
  Award, 
  Binary, 
  CheckSquare, 
  FileSpreadsheet,
  ShieldCheck
} from "lucide-react";

export type ShellNavTab =
  | "OVERVIEW"
  | "FLOWS"
  | "FINDINGS"
  | "CERTIFICATES"
  | "DISSECTOR"
  | "STANDARDS"
  | "REMEDIATION"
  | "REPORT";

interface NavStripProps {
  activeTab: ShellNavTab;
  onSelectTab: (tab: ShellNavTab) => void;
  flowCount: number;
  findingCount: number;
}

const TABS: { 
  id: ShellNavTab; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  badge?: (flows: number, findings: number) => number | null 
}[] = [
  { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
  { id: "FLOWS", label: "Flows", icon: Layers, badge: (flows) => flows },
  { id: "FINDINGS", label: "Findings", icon: ShieldAlert, badge: (_, findings) => findings },
  { id: "CERTIFICATES", label: "Certificates", icon: Award },
  { id: "DISSECTOR", label: "Dissector", icon: Binary },
  { id: "STANDARDS", label: "Standards", icon: CheckSquare },
  { id: "REMEDIATION", label: "Remediation", icon: ShieldCheck },
  { id: "REPORT", label: "Dossier", icon: FileSpreadsheet },
];

export function NavStrip({
  activeTab,
  onSelectTab,
  flowCount,
  findingCount,
}: NavStripProps) {
  return (
    <nav className="w-full border-b border-[#1c1d22] bg-[#08080a] select-none" aria-label="Forensic Navigation Bar">
      <div className="max-w-[1216px] mx-auto px-6 flex items-center justify-between gap-4">
        {/* Navigation Links with Slash 2px underline active indicator */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.badge ? tab.badge(flowCount, findingCount) : null;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3.5 py-3 text-sm font-sans font-medium transition-colors flex items-center gap-2 shrink-0 ${
                  isActive ? "text-white" : "text-[#9194a1] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#cc9166]" : "text-[#777a88]"}`} />
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                      isActive
                        ? "bg-[#121317] text-[#cc9166] border border-[#cc9166]/40"
                        : "bg-[#121317] text-[#9194a1] border border-[#1c1d22]"
                    }`}
                  >
                    {count}
                  </span>
                )}

                {/* Slash 2px Underline Active Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#cc9166] rounded-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Sensor Telemetry (Right) */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono text-[#9194a1] shrink-0">
          <div className="flex items-center gap-2 bg-[#040406] px-3 py-1 rounded-full border border-[#1c1d22]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]" />
            </span>
            <span className="text-[#e2e3e9]">TAP-01 MIRROR</span>
            <span className="text-[#2e3038]">|</span>
            <span className="text-[#cc9166]">PASSIVE SENSOR</span>
            <Activity className="w-3.5 h-3.5 text-[#cc9166]" strokeWidth={2} />
          </div>
        </div>
      </div>
    </nav>
  );
}
