"use client";

import React from "react";
import { ShieldAlert, AlertOctagon, CheckCircle2 } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface SimulationThreatMatrixProps {
  currentStage: number;
  activeCase: EvidenceCase;
  enforceTls13: boolean;
  enforcePfs: boolean;
  enforceAead: boolean;
  renewCerts: boolean;
}

export function SimulationThreatMatrix({
  currentStage,
  activeCase,
  enforceTls13,
  enforcePfs,
  enforceAead,
  renewCerts,
}: SimulationThreatMatrixProps) {
  const vulns = activeCase.data.vulnerabilities || [];

  // Default fallback threats if case has no vulns (e.g. CASE-01 already hardened)
  const threats = vulns.length > 0 ? vulns : [
    {
      id: "THREAT-01",
      title: "Protocol Downgrade Interception",
      mitre_attack_id: "T1557.002",
      mitre_attack_technique: "Adversary-in-the-Middle",
      severity: "low",
    },
    {
      id: "THREAT-02",
      title: "Plaintext Credential Harvesting",
      mitre_attack_id: "T1552.001",
      mitre_attack_technique: "Unsecured Credentials",
      severity: "low",
    },
  ];

  // Derive neutralization status from policies that address each specific threat
  const isNeutralized = (t: { title?: string; mitre_attack_id?: string; mitre_attack_technique?: string; description?: string }) => {
    if (activeCase.id === "CASE-01") return true; // Already secure
    if (currentStage < 1) return false;

    const text = `${t.title || ""} ${t.mitre_attack_technique || ""} ${t.mitre_attack_id || ""} ${t.description || ""}`.toLowerCase();

    // 1. Certificate flaws (self-signed, expired, weak key)
    if (text.includes("cert") || text.includes("self-signed") || text.includes("expired") || text.includes("t1587.003")) {
      return renewCerts;
    }

    // 2. Forward secrecy / Static RSA / Retrospective decryption
    if (text.includes("forward secrecy") || text.includes("pfs") || text.includes("static rsa") || text.includes("re-key")) {
      return enforcePfs;
    }

    // 3. Weak ciphers (3DES Sweet32, CBC mode, RC4, Non-AEAD)
    if (text.includes("cipher") || text.includes("3des") || text.includes("sweet32") || text.includes("cbc") || text.includes("rc4") || text.includes("aead")) {
      return enforceAead;
    }

    // 4. Protocol downgrade / Cleartext exposure / STRIPTLS / Unsecured Credentials
    if (text.includes("downgrade") || text.includes("striptls") || text.includes("cleartext") || text.includes("credential") || text.includes("t1557.002") || text.includes("t1552.001") || text.includes("tls 1.0") || text.includes("tls 1.1") || text.includes("obsolete")) {
      return enforceTls13;
    }

    // Default fallback: requires at least one hardening policy active
    return enforceTls13 || enforcePfs || enforceAead || renewCerts;
  };

  const neutralizedCount = threats.filter((t) => isNeutralized(t)).length;

  return (
    <div className="bg-[#08080a] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#1c1d22]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[#cc9166]" />
          <span className="text-white text-[11px] font-semibold uppercase">
            MITRE ATT&amp;CK Threat Neutralization Matrix
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#9194a1]">Neutralized:</span>
          <span className={`px-2 py-0.5 rounded font-semibold ${
            neutralizedCount === threats.length
              ? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30"
              : "bg-[#cc9166]/10 text-[#cc9166] border border-[#cc9166]/30"
          }`}>
            {neutralizedCount} / {threats.length} THREATS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {threats.map((t, idx) => {
          const neutralized = isNeutralized(t);

          return (
            <div
              key={t.id || idx}
              className={`p-2.5 rounded-[8px] border transition-all flex items-start justify-between gap-3 ${
                neutralized
                  ? "bg-[#121317] border-[#34d399]/40 shadow-[0_0_10px_rgba(52,211,153,0.08)]"
                  : "bg-[#121317] border-[#ef4444]/40"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    neutralized ? "bg-[#34d399]/20 text-[#34d399]" : "bg-[#ef4444]/20 text-[#ef4444]"
                  }`}>
                    {t.mitre_attack_id || "T1557"}
                  </span>
                  <span className="text-white text-xs font-medium truncate max-w-[180px]">
                    {t.title}
                  </span>
                </div>
                <div className="text-[10px] text-[#9194a1]">
                  {t.mitre_attack_technique || "Adversary Technique"}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 mt-0.5">
                {neutralized ? (
                  <span className="px-2 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 text-[9px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>DEFENDED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 text-[9px] font-semibold flex items-center gap-1 animate-pulse">
                    <AlertOctagon className="w-2.5 h-2.5" />
                    <span>EXPOSED</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
