"use client";

import { ShieldCheck, Cpu, Terminal, FileCode2 } from "lucide-react";

export function UploadCapabilities() {
  const specs = [
    {
      icon: Terminal,
      title: "Passive Stream Reassembly",
      detail: "TCP stream extraction for SMTP (25/465/587), IMAP (143/993), POP3 (110/995)",
    },
    {
      icon: ShieldCheck,
      title: "STRIPTLS & Downgrade Detection",
      detail: "Heuristic tracking of MitM packet tampering and unencrypted credential leaks",
    },
    {
      icon: Cpu,
      title: "X.509 & Cipher Cryptanalysis",
      detail: "Key length, signature hash, expired CA validation, and forward secrecy checks",
    },
    {
      icon: FileCode2,
      title: "NIST & RFC Compliance Matrix",
      detail: "Automated scoring against NIST SP 800-52r2, RFC 8314, and RFC 8996 standards",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl mt-8">
      {specs.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-soc-border bg-soc-card/70 backdrop-blur-sm flex flex-col justify-between hover:border-soc-borderHighlight transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200 tracking-tight">
                {item.title}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {item.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}
