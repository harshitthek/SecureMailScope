"use client";

import { Session, SessionDetailTab } from "@/lib/types";
import { X, ShieldAlert, ShieldCheck, Lock, KeyRound, FileCheck, Binary, Layers, ArrowRight } from "lucide-react";
import { SessionDetailSummaryTab } from "./session-detail-summary-tab";
import { SessionDetailFlowTab } from "./session-detail-flow-tab";
import { SessionDetailTlsTab } from "./session-detail-tls-tab";
import { SessionDetailCertTab } from "./session-detail-cert-tab";
import { SessionDetailRawTab } from "./session-detail-raw-tab";
import { SessionDetailStandardsTab } from "./session-detail-standards-tab";

interface SessionDetailModalProps {
  session: Session | null;
  isOpen: boolean;
  activeTab: SessionDetailTab;
  onTabChange: (tab: SessionDetailTab) => void;
  onClose: () => void;
  onNavigateToDissector?: (streamId: number) => void;
}

const TABS: { id: SessionDetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "SUMMARY", label: "SUMMARY", icon: Layers },
  { id: "PROTOCOL_FLOW", label: "PROTOCOL FLOW", icon: ArrowRight },
  { id: "TLS", label: "TLS", icon: Lock },
  { id: "CERTIFICATE", label: "CERTIFICATE", icon: KeyRound },
  { id: "RAW_STREAM", label: "RAW STREAM", icon: Binary },
  { id: "STANDARDS", label: "STANDARDS", icon: FileCheck },
];

export function SessionDetailModal({
  session, isOpen, activeTab, onTabChange, onClose, onNavigateToDissector,
}: SessionDetailModalProps) {
  if (!isOpen || !session) return null;
  const isCritical = session.session_score < 50 || session.session_severity === "critical";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-5xl h-[88vh] max-h-[840px] bg-tactical-surface border border-tactical-borderHighlight flex flex-col shadow-2xl text-tactical-text relative">
        {/* 1. Modal Header */}
        <div className="px-5 py-4 border-b border-tactical-border bg-tactical-surface flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 ${
                isCritical
                  ? "border-phosphor-hazard/60 bg-phosphor-hazard/10 text-phosphor-hazard"
                  : "border-phosphor-green/60 bg-phosphor-green/10 text-phosphor-green"
              }`}
            >
              {isCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-sans font-bold text-tactical-text tracking-wide truncate">
                  {session.server_name || "TARGET HOST"}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 border border-tactical-border bg-tactical-elevated text-phosphor-cyan font-bold">
                  {session.protocol}
                </span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 border font-bold ${
                    isCritical
                      ? "border-phosphor-hazard/50 bg-phosphor-hazard/15 text-phosphor-hazard"
                      : "border-phosphor-green/50 bg-phosphor-green/15 text-phosphor-green"
                  }`}
                >
                  SCORE: {session.session_score} ({session.session_grade})
                </span>
              </div>
              <div className="text-xs font-mono text-tactical-dim flex items-center gap-2 mt-1">
                <span>FLOW VECTOR:</span>
                <span className="text-tactical-text font-bold">
                  {session.src_ip}:{session.src_port} &rarr; {session.dst_ip}:{session.dst_port}
                </span>
                <span>•</span>
                <span>TIME: {session.timestamp?.slice(11, 19) || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {onNavigateToDissector && (
              <button
                onClick={() => onNavigateToDissector(session.session_id)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-phosphor-cyan/60 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 active:translate-y-[1px] text-phosphor-cyan text-xs font-bold transition-all"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>FULL DISSECTOR</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 border border-tactical-border hover:border-tactical-text text-tactical-dim hover:text-tactical-text bg-tactical-surfaceHover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center border-b border-tactical-border bg-tactical-surface px-3 overflow-x-auto flex-shrink-0 font-mono">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-phosphor-cyan text-tactical-text bg-tactical-elevated/50"
                    : "border-transparent text-tactical-dim hover:text-tactical-text hover:bg-tactical-surfaceHover"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-phosphor-cyan" : "text-tactical-dim"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "SUMMARY" && <SessionDetailSummaryTab session={session} isCritical={isCritical} />}
          {activeTab === "PROTOCOL_FLOW" && <SessionDetailFlowTab session={session} />}
          {activeTab === "TLS" && <SessionDetailTlsTab session={session} />}
          {activeTab === "CERTIFICATE" && <SessionDetailCertTab cert={session.certificate} />}
          {activeTab === "RAW_STREAM" && <SessionDetailRawTab session={session} />}
          {activeTab === "STANDARDS" && <SessionDetailStandardsTab session={session} />}
        </div>
      </div>
    </div>
  );
}
