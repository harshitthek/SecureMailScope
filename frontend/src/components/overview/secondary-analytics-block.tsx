"use client";

import { useMemo } from "react";
import { Session } from "@/lib/types";
import { TlsDistributionStrip } from "./tls-distribution-strip";

interface SecondaryAnalyticsBlockProps {
  sessions: Session[];
}

export function SecondaryAnalyticsBlock({ sessions }: SecondaryAnalyticsBlockProps) {
  // 1. TLS Version counts
  const tlsStats = useMemo(() => {
    const counts: Record<string, number> = {
      "TLS 1.3": 0,
      "TLS 1.2": 0,
      "TLS 1.0": 0,
      "CLEARTEXT": 0,
    };
    for (const s of sessions) {
      if (!s.is_encrypted) counts["CLEARTEXT"]++;
      else if (s.tls_version === "TLS 1.3") counts["TLS 1.3"]++;
      else if (s.tls_version === "TLS 1.2") counts["TLS 1.2"]++;
      else counts["TLS 1.0"]++;
    }
    return counts;
  }, [sessions]);

  // 2. Cipher profile
  const cipherStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      const name = !s.is_encrypted
        ? "NONE"
        : s.cipher_suite_name?.includes("3DES")
        ? "3DES-EDE-CBC"
        : s.cipher_suite_name?.includes("GCM")
        ? "AES-GCM (AEAD)"
        : s.cipher_suite_name || "OTHER";
      counts[name] = (counts[name] || 0) + 1;
    }
    return counts;
  }, [sessions]);

  // 3. Certificate health
  const certStats = useMemo(() => {
    let dissected = 0;
    let valid = 0;
    let expired = 0;
    let weakKey = 0;
    let weakSig = 0;

    for (const s of sessions) {
      if (s.certificate) {
        dissected++;
        if (s.certificate.is_expired) expired++;
        else valid++;
        if (s.certificate.is_weak_key) weakKey++;
        if (s.certificate.is_weak_signature) weakSig++;
      }
    }
    return { dissected, valid, expired, weakKey, weakSig };
  }, [sessions]);

  return (
    <section className="w-full py-8 select-none">
      <div className="flex items-center justify-between pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-tactical-dim uppercase block">
            TELEMETRY BREAKDOWN
          </span>
          <h3 className="text-xl sm:text-2xl font-sans font-black text-white uppercase tracking-tight mt-0.5">
            CRYPTOGRAPHIC &amp; CERTIFICATE PROFILE
          </h3>
        </div>
        <span className="text-xs font-mono text-tactical-dim">
          PASSIVE DEEP DISSECTION
        </span>
      </div>

      {/* Single Unified Analytical Grid: Aligned Data (NO CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-xs">
        {/* Column 1: TLS Version Distribution */}
        <TlsDistributionStrip stats={tlsStats} totalFlows={sessions.length} />

        {/* Column 2: Cipher Suite Profile */}
        <div className="space-y-3 md:border-l border-tactical-border/40 md:pl-8">
          <div className="border-b border-tactical-border/70 pb-2 text-[10px] uppercase tracking-widest text-tactical-dim font-bold">
            CIPHER SUITE PROFILE
          </div>
          <div className="space-y-2.5">
            {Object.entries(cipherStats).map(([cipher, count]) => {
              const isCrit = cipher.includes("3DES") || cipher === "NONE";
              const isSecure = cipher.includes("GCM");

              return (
                <div key={cipher} className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
                  <span className={isSecure ? "text-phosphor-green" : isCrit ? "text-phosphor-hazard" : "text-tactical-text"}>
                    {cipher}
                  </span>
                  <span className="text-white font-bold tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Certificate Health */}
        <div className="space-y-3 md:border-l border-tactical-border/40 md:pl-8">
          <div className="border-b border-tactical-border/70 pb-2 text-[10px] uppercase tracking-widest text-tactical-dim font-bold">
            CERTIFICATE HEALTH
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim">Certificates Dissected</span>
              <span className="text-white font-bold tabular-nums">{certStats.dissected}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim">Valid Cryptographic State</span>
              <span className="text-phosphor-green font-bold tabular-nums">{certStats.valid}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim">Expired Certificates</span>
              <span className={`font-bold tabular-nums ${certStats.expired > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                {certStats.expired}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim">Weak RSA Keys (&lt; 2048-bit)</span>
              <span className={`font-bold tabular-nums ${certStats.weakKey > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                {certStats.weakKey}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b border-tactical-border/20 pb-1.5">
              <span className="text-tactical-dim">Weak Signatures (SHA-1 / MD5)</span>
              <span className={`font-bold tabular-nums ${certStats.weakSig > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                {certStats.weakSig}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
