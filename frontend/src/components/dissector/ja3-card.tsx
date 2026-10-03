"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";

interface Ja3CardProps {
  ja3Hash: string | null;
  ja3ClientName: string | null;
  ja3IsKnown: boolean;
}

export function Ja3Card({ ja3Hash, ja3ClientName, ja3IsKnown }: Ja3CardProps) {
  const [copied, setCopied] = useState(false);

  const copyJa3 = () => {
    if (ja3Hash) {
      navigator.clipboard.writeText(ja3Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="border border-tactical-border bg-tactical-surface p-3 space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-tactical-text font-bold">
        <div className="flex items-center gap-1.5 text-phosphor-green">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>JA3 CLIENT SIGNATURE</span>
        </div>
        <span className="text-[9px] uppercase px-1 py-0.2 border border-tactical-border text-tactical-dim">
          INTEL
        </span>
      </div>

      <div className="space-y-2 text-[11px] text-tactical-dim">
        <div>
          <span className="text-[9px] uppercase text-tactical-muted block">Identified Client Engine</span>
          <span className="text-tactical-text font-bold">
            {ja3ClientName || "Unknown Mail Client / Cleartext Agent"}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase text-tactical-muted block">JA3 MD5 Wire Hash</span>
          <div className="mt-1 flex items-center justify-between gap-1 p-1.5 bg-tactical-surface border border-tactical-border text-[10px] text-tactical-text font-mono">
            <span className="truncate">{ja3Hash || "No TLS ClientHello Record"}</span>
            {ja3Hash && (
              <button
                onClick={copyJa3}
                className="p-1 text-tactical-dim hover:text-tactical-text transition-colors focus-visible:ring-1 focus-visible:ring-phosphor-cyan"
                title="Copy JA3 Hash"
              >
                {copied ? <Check className="w-3 h-3 text-phosphor-green" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between border-t border-tactical-border/40 text-[10px]">
          <span>Registry Status:</span>
          <span className={ja3IsKnown ? "text-phosphor-green font-bold" : "text-phosphor-amber font-bold"}>
            {ja3IsKnown ? "KNOWN LEGITIMATE" : "UNMAPPED SIGNATURE"}
          </span>
        </div>
      </div>
    </div>
  );
}
