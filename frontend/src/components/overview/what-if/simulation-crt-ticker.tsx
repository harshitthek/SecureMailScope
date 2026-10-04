"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Terminal, ShieldAlert, Cpu } from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface SimulationCrtTickerProps {
  currentStage: number;
  activeCase: EvidenceCase;
}

interface LogEntry {
  id: string;
  stage: number;
  timestamp: string;
  category: "INGRESS" | "POLICY" | "QUARANTINE" | "CRYPTO" | "CONVERGED";
  message: string;
}

export function SimulationCrtTicker({ currentStage, activeCase }: SimulationCrtTickerProps) {
  const [filter, setFilter] = useState<"ALL" | "QUARANTINE" | "CRYPTO">("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  const logs = useMemo(() => {
    const entries: LogEntry[] = [
      {
        id: "l-0",
        stage: 0,
        timestamp: "00:00.010",
        category: "INGRESS",
        message: `TAP-01 active: Listening on mail ports (25, 587, 465, 993, 110). Baseline enterprise score: ${activeCase.data.enterprise_score} (Grade ${activeCase.data.enterprise_grade}).`,
      },
    ];

    if (currentStage >= 1) {
      entries.push(
        {
          id: "l-1",
          stage: 1,
          timestamp: "00:01.120",
          category: "POLICY",
          message: "MTA Patch synthesizer compiling directives: smtpd_tls_security_level=encrypt, mandatory_protocols=TLSv1.3.",
        },
        {
          id: "l-2",
          stage: 1,
          timestamp: "00:01.350",
          category: "POLICY",
          message: "Dovecot 10-ssl.conf patched: ssl=required, ssl_cipher_list restricted to AEAD suites.",
        }
      );
    }

    if (currentStage >= 2) {
      entries.push(
        {
          id: "l-3",
          stage: 2,
          timestamp: "00:02.040",
          category: "QUARANTINE",
          message: "INTERCEPT: Ingress probe attempted cleartext AUTH PLAIN on submission port 587 -> SENSOR DROPPED UNENCRYPTED FRAME.",
        },
        {
          id: "l-4",
          stage: 2,
          timestamp: "00:02.480",
          category: "QUARANTINE",
          message: "MITM-ALERT: STRIPTLS attack detected on flow #3. 250-STARTTLS capability enforced via MTA-STS policy anchor.",
        }
      );
    }

    if (currentStage >= 3) {
      entries.push(
        {
          id: "l-5",
          stage: 3,
          timestamp: "00:03.110",
          category: "CRYPTO",
          message: "CIPHER ELEVATION: Purged legacy CBC mode (3DES-EDE-CBC). Renegotiated TLS_AES_256_GCM_SHA384 (0x1301).",
        },
        {
          id: "l-6",
          stage: 3,
          timestamp: "00:03.620",
          category: "CRYPTO",
          message: "PQC RE-KEY: Static RSA 1024-bit replaced by NIST FIPS 203 Hybrid X25519MLKEM768 (0x11EC). Perfect Forward Secrecy verified.",
        },
        {
          id: "l-7",
          stage: 3,
          timestamp: "00:03.890",
          category: "CRYPTO",
          message: "PKI RENEWAL: Injected Let's Encrypt 3072-bit CA root cert. SAN mail.defense.gov.in verified.",
        }
      );
    }

    if (currentStage >= 4) {
      entries.push(
        {
          id: "l-8",
          stage: 4,
          timestamp: "00:04.500",
          category: "CONVERGED",
          message: `POSTURE CONVERGENCE REACHED: All ${activeCase.data.total_sessions} streams compliant. Zero residual vulnerabilities. NIST SP 800-52r2 compliance: PASS.`,
        }
      );
    }

    return entries;
  }, [currentStage, activeCase]);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (filter === "QUARANTINE") return logs.filter((l) => l.category === "QUARANTINE");
    if (filter === "CRYPTO") return logs.filter((l) => l.category === "CRYPTO");
    return logs;
  }, [logs, filter]);

  return (
    <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-4 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Ticker Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1c1d22]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#34d399]" />
          <span className="text-white text-[11px] font-semibold tracking-wider">
            FORENSIC CRT EVENT TICKER (LIVE)
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 animate-pulse">
            ● RECORDING
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === "ALL" ? "bg-white text-black font-semibold" : "text-[#9194a1] hover:text-white"
            }`}
          >
            ALL ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("QUARANTINE")}
            className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
              filter === "QUARANTINE" ? "bg-[#cc9166] text-black font-semibold" : "text-[#9194a1] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>QUARANTINE</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("CRYPTO")}
            className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
              filter === "CRYPTO" ? "bg-[#a855f7] text-white font-semibold" : "text-[#9194a1] hover:text-white"
            }`}
          >
            <Cpu className="w-2.5 h-2.5" />
            <span>CRYPTO</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div
        ref={scrollRef}
        className="h-36 overflow-y-auto bg-[#08080a] border border-[#1c1d22] rounded-[6px] p-2.5 space-y-1.5 font-mono text-[11px] leading-relaxed scrollbar-thin select-text"
      >
        {filteredLogs.map((log) => {
          let badgeColor = "text-[#9194a1] border-[#2e3038]";
          if (log.category === "POLICY") badgeColor = "text-[#cc9166] border-[#cc9166]/40 bg-[#cc9166]/10";
          if (log.category === "QUARANTINE") badgeColor = "text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10";
          if (log.category === "CRYPTO") badgeColor = "text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10";
          if (log.category === "CONVERGED") badgeColor = "text-[#34d399] border-[#34d399]/40 bg-[#34d399]/10";

          return (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-[#555866] shrink-0 text-[10px]">{log.timestamp}</span>
              <span className={`px-1 rounded border text-[9px] font-semibold shrink-0 ${badgeColor}`}>
                {log.category}
              </span>
              <span className="text-[#d1d5db]">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
