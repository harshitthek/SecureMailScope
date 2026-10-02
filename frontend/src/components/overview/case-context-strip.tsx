"use client";

interface CaseContextStripProps {
  caseCode: string;
  filename: string;
  totalPackets: number;
  totalFlows: number;
}

export function CaseContextStrip({
  caseCode,
  filename,
  totalPackets,
  totalFlows,
}: CaseContextStripProps) {
  return (
    <div className="w-full flex flex-wrap items-center justify-between text-xs text-tactical-dim pb-6 pt-1 border-b border-tactical-border/40 select-none">
      <div className="flex items-center gap-2.5 font-mono">
        <span className="text-white font-bold tracking-wider uppercase text-[11px]">
          CASE {caseCode.toUpperCase()}
        </span>
        <span className="text-tactical-muted">·</span>
        <span className="text-tactical-text truncate max-w-[240px]">
          {filename || "enterprise_mail_capture.pcap"}
        </span>
        <span className="text-tactical-muted">·</span>
        <span>{totalPackets.toLocaleString()} packets</span>
        <span className="text-tactical-muted">·</span>
        <span className="text-white font-semibold">
          {totalFlows} reconstructed flows
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-tactical-muted">CAPTURE TYPE:</span>
        <span className="text-tactical-text font-bold">PASSIVE PCAP ANALYSIS</span>
        <span className="text-tactical-muted">·</span>
        <span className="text-phosphor-cyan">OFFLINE FORENSICS</span>
      </div>
    </div>
  );
}
