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
    <div className="w-full flex flex-wrap items-center justify-between text-[14px] text-tactical-dim pb-3 pt-1 border-b border-tactical-border/40 select-none font-mono">
      <div className="flex items-center gap-3">
        <span className="text-tactical-text font-black tracking-wider uppercase text-[14px] bg-tactical-surfaceHover px-2.5 py-0.5 border border-tactical-border">
          CASE {caseCode.replace("CASE-", "")}
        </span>
        <span className="text-tactical-muted">·</span>
        <span className="text-tactical-text font-bold text-[15px] truncate max-w-[320px]">
          {filename || "enterprise_mail_capture.pcap"}
        </span>
        <span className="text-tactical-muted">·</span>
        <span className="text-tactical-text font-medium text-[15px]">
          {totalPackets.toLocaleString()} PACKETS
        </span>
        <span className="text-tactical-muted">·</span>
        <span className="text-phosphor-cyan font-bold text-[15px]">
          {totalFlows} RECONSTRUCTED FLOWS
        </span>
      </div>

      <div className="flex items-center gap-3 text-[14px]">
        <span className="text-tactical-muted font-medium">SENSOR: TAP-01 ACTIVE</span>
        <span className="text-tactical-muted">·</span>
        <span className="text-phosphor-green font-bold">PASSIVE PCAP FORENSICS</span>
      </div>
    </div>
  );
}
