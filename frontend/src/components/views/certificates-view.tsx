"use client";

import { useMemo } from "react";
import { Session } from "@/lib/types";
import { KeyRound } from "lucide-react";

interface CertificatesViewProps {
  sessions: Session[];
  onOpenSessionDetail: (sessionId: number) => void;
}

export function CertificatesView({ sessions, onOpenSessionDetail }: CertificatesViewProps) {
  // Aggregate certs with session links
  const certItems = useMemo(() => {
    const list = [];
    for (const s of sessions) {
      if (s.certificate) {
        list.push({
          sessionId: s.session_id,
          serverName: s.server_name,
          protocol: s.protocol,
          cert: s.certificate,
        });
      }
    }
    return list;
  }, [sessions]);

  const summary = useMemo(() => {
    let valid = 0;
    let expired = 0;
    let weakKey = 0;
    let weakSig = 0;
    let selfSigned = 0;

    for (const item of certItems) {
      if (item.cert.is_expired) expired++;
      else valid++;
      if (item.cert.is_weak_key) weakKey++;
      if (item.cert.is_weak_signature) weakSig++;
      if (item.cert.is_self_signed) selfSigned++;
    }

    return { total: certItems.length, valid, expired, weakKey, weakSig, selfSigned };
  }, [certItems]);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1680px] mx-auto w-full select-none font-mono">
      {/* 1. Header & Summary Bar */}
      <div className="p-4 border border-tactical-border bg-tactical-surface space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-phosphor-cyan" />
              X.509 CERTIFICATE INVENTORY &amp; HEALTH AUDIT ({certItems.length} CERTIFICATES)
            </h2>
            <p className="text-xs text-tactical-dim font-mono mt-0.5">
              Passive extraction and validation of leaf certificates presented across inspected email endpoints
            </p>
          </div>
          <div className="text-[11px] text-tactical-dim italic">
            * Leaf cryptographic properties verified. Chain-of-trust not asserted without local PKI bundle.
          </div>
        </div>

        {/* Blueprint KPI Strip (gap-px pattern) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-tactical-border border border-tactical-border text-xs">
          <div className="p-3 bg-tactical-surface">
            <span className="text-[10px] uppercase text-tactical-dim block">Total Certs</span>
            <span className="text-2xl font-mono font-bold text-white tabular-nums">{summary.total}</span>
          </div>

          <div className="p-3 bg-tactical-surface">
            <span className="text-[10px] uppercase text-tactical-dim block">Valid Certificates</span>
            <span className="text-2xl font-mono font-bold text-phosphor-green tabular-nums">{summary.valid}</span>
          </div>

          <div className="p-3 bg-tactical-surface">
            <span className="text-[10px] uppercase text-tactical-dim block">Expired</span>
            <span className={`text-2xl font-mono font-bold tabular-nums ${summary.expired > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
              {summary.expired}
            </span>
          </div>

          <div className="p-3 bg-tactical-surface">
            <span className="text-[10px] uppercase text-tactical-dim block">Weak Keys (&lt;2048b)</span>
            <span className={`text-2xl font-mono font-bold tabular-nums ${summary.weakKey > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
              {summary.weakKey}
            </span>
          </div>

          <div className="p-3 bg-tactical-surface">
            <span className="text-[10px] uppercase text-tactical-dim block">Self-Signed</span>
            <span className={`text-2xl font-mono font-bold tabular-nums ${summary.selfSigned > 0 ? "text-phosphor-amber" : "text-tactical-dim"}`}>
              {summary.selfSigned}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Aggregate Certificate Health Table */}
      <div className="border border-tactical-border bg-tactical-surface overflow-x-auto shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-tactical-border text-[10px] text-tactical-dim uppercase bg-black/60">
              <th className="py-3 px-3 w-16 text-center">STREAM</th>
              <th className="py-3 px-4 min-w-[220px]">SUBJECT (COMMON NAME)</th>
              <th className="py-3 px-4 min-w-[200px]">ISSUER (CA)</th>
              <th className="py-3 px-3 min-w-[160px]">EXPIRY &amp; DAYS</th>
              <th className="py-3 px-3">SIGNATURE HASH</th>
              <th className="py-3 px-3">PUBLIC KEY &amp; SIZE</th>
              <th className="py-3 px-3 text-center">SELF-SIGNED</th>
              <th className="py-3 px-3 text-center">HEALTH</th>
              <th className="py-3 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tactical-border/60">
            {certItems.length > 0 ? (
              certItems.map((item) => {
                const { cert } = item;
                const isExpired = cert.is_expired;
                const isWeakKey = cert.is_weak_key;
                const isWeakSig = cert.is_weak_signature;
                const isSelfSigned = cert.is_self_signed;
                const hasIssues = isExpired || isWeakKey || isWeakSig || isSelfSigned;

                return (
                  <tr
                    key={item.sessionId}
                    onClick={() => onOpenSessionDetail(item.sessionId)}
                    className="hover:bg-tactical-surfaceHover transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-white">#{item.sessionId}</span>
                      <span className="text-[10px] text-tactical-dim block">{item.protocol}</span>
                    </td>

                    <td className="py-3 px-4 font-bold text-white truncate max-w-[220px]" title={cert.subject_cn}>
                      {cert.subject_cn}
                    </td>

                    <td className="py-3 px-4 text-tactical-dim truncate max-w-[200px]" title={cert.issuer_cn}>
                      {cert.issuer_cn}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-tactical-text text-xs">{cert.not_after?.slice(0, 10)}</div>
                      <div className={`text-[10px] font-bold ${isExpired ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                        {isExpired ? `EXPIRED (${cert.days_remaining}d)` : `${cert.days_remaining}d remaining`}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 border text-[10px] font-bold ${
                          isWeakSig
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                            : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        }`}
                      >
                        {cert.signature_hash}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-white font-bold">{cert.public_key_type} {cert.public_key_bits}b</div>
                      {isWeakKey && (
                        <span className="text-[9px] text-phosphor-hazard font-bold block">
                          WEAK KEY &lt; 2048b
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 border text-[10px] font-bold ${
                          isSelfSigned
                            ? "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                            : "border-tactical-border text-tactical-dim"
                        }`}
                      >
                        {isSelfSigned ? "YES" : "NO"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-bold ${
                          hasIssues
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                            : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        }`}
                      >
                        {hasIssues ? "DEFICIENT" : "VALID"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSessionDetail(item.sessionId);
                        }}
                        className="px-2.5 py-1 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-white text-[10px] font-bold transition-all active:translate-y-[1px]"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-10 text-center text-xs text-tactical-dim">
                  No X.509 certificates extracted from the current capture.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
