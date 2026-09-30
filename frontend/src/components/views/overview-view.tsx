"use client";

import { useMemo } from "react";
import { AnalysisResult, NavView } from "@/lib/types";
import { PostureDial } from "@/components/forensics-deck/posture-dial";
import { ProtocolChart } from "@/components/protocol-chart";
import { CipherChart } from "@/components/cipher-chart";
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Network,
  ArrowRight,
} from "lucide-react";

interface OverviewViewProps {
  data: AnalysisResult;
  caseCode: string;
  onNavigate: (view: NavView) => void;
  onOpenSessionDetail: (sessionId: number) => void;
}

export function OverviewView({
  data,
  caseCode,
  onNavigate,
  onOpenSessionDetail,
}: OverviewViewProps) {
  const {
    enterprise_score,
    enterprise_grade,
    total_sessions,
    total_packets,
    sessions,
    vulnerabilities,
    protocol_distribution,
    cipher_distribution,
    certificate_summary,
  } = data;

  // Key KPI calculations
  const encryptedCount = useMemo(
    () => sessions.filter((s) => s.is_encrypted).length,
    [sessions]
  );
  const pfsCount = useMemo(
    () => sessions.filter((s) => s.has_forward_secrecy).length,
    [sessions]
  );
  const critVulns = useMemo(
    () => vulnerabilities.filter((v) => v.severity === "critical").length,
    [vulnerabilities]
  );
  const highVulns = useMemo(
    () => vulnerabilities.filter((v) => v.severity === "high").length,
    [vulnerabilities]
  );

  const certHealth = useMemo(() => {
    let valid = 0;
    let expired = 0;
    let weakKey = 0;
    sessions.forEach((s) => {
      if (s.certificate) {
        if (s.certificate.is_expired) expired++;
        else valid++;
        if (s.certificate.is_weak_key) weakKey++;
      }
    });
    return { valid, expired, weakKey, total: valid + expired };
  }, [sessions]);

  const encryptionRatio = total_sessions > 0 ? Math.round((encryptedCount / total_sessions) * 100) : 0;
  const pfsRatio = total_sessions > 0 ? Math.round((pfsCount / total_sessions) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 font-mono max-w-[1600px] mx-auto">
      {/* 1. TOP SECTION: EXECUTIVE POSTURE & KPI TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Posture Score Dial (lg:col-span-4) */}
        <div className="lg:col-span-4 h-full min-h-[260px]">
          <PostureDial
            score={enterprise_score}
            grade={enterprise_grade}
            caseCode={caseCode}
          />
        </div>

        {/* 4 Executive KPI Cards (lg:col-span-8) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Session & Packet Count */}
          <div className="p-3.5 border border-tactical-border bg-tactical-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-tactical-dim uppercase pb-2 border-b border-tactical-border/70">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-phosphor-cyan" />
                SESSIONS & WIRE PACKETS
              </span>
              <span className="text-[10px] text-tactical-dim">PORT DISPATCH</span>
            </div>
            <div className="py-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white tabular-nums">
                  {total_sessions}
                </span>
                <span className="text-xs text-tactical-dim ml-1.5">STREAMS</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-phosphor-cyan tabular-nums">
                  {total_packets}
                </span>
                <span className="text-[10px] text-tactical-dim ml-1">PKTS</span>
              </div>
            </div>
            <div className="text-[10px] text-tactical-dim border-t border-tactical-border/60 pt-2 flex items-center justify-between">
              <span>PORTS: 25, 587, 465, 143, 993, 110, 995</span>
              <button
                onClick={() => onNavigate("SESSIONS")}
                className="text-phosphor-cyan hover:underline flex items-center gap-0.5 font-bold"
              >
                VIEW ALL &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Threat Vectors */}
          <div className="p-3.5 border border-tactical-border bg-tactical-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-tactical-dim uppercase pb-2 border-b border-tactical-border/70">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-phosphor-hazard" />
                SECURITY FINDINGS
              </span>
              <span className="text-[10px] text-tactical-dim">SEVERITY AUDIT</span>
            </div>
            <div className="py-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-phosphor-hazard tabular-nums">
                  {critVulns}
                </span>
                <span className="text-xs text-tactical-dim ml-1.5">CRITICAL</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-phosphor-amber tabular-nums">
                  {highVulns}
                </span>
                <span className="text-[10px] text-tactical-dim ml-1">HIGH</span>
              </div>
            </div>
            <div className="text-[10px] text-tactical-dim border-t border-tactical-border/60 pt-2 flex items-center justify-between">
              <span>TOTAL: {vulnerabilities.length} FINDINGS DETECTED</span>
              <button
                onClick={() => onNavigate("FINDINGS")}
                className="text-phosphor-hazard hover:underline flex items-center gap-0.5 font-bold"
              >
                TRIAGE &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Certificate Health */}
          <div className="p-3.5 border border-tactical-border bg-tactical-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-tactical-dim uppercase pb-2 border-b border-tactical-border/70">
              <span className="font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-phosphor-green" />
                CERTIFICATE HEALTH
              </span>
              <span className="text-[10px] text-tactical-dim">X.509 AUDIT</span>
            </div>
            <div className="py-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-phosphor-green tabular-nums">
                  {certHealth.valid}
                </span>
                <span className="text-xs text-tactical-dim ml-1.5">VALID</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold tabular-nums ${certHealth.expired > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                  {certHealth.expired}
                </span>
                <span className="text-[10px] text-tactical-dim ml-1">EXPIRED</span>
              </div>
            </div>
            <div className="text-[10px] text-tactical-dim border-t border-tactical-border/60 pt-2 flex items-center justify-between">
              <span>WEAK KEYS (&lt;2048b): {certHealth.weakKey}</span>
              <button
                onClick={() => onNavigate("CERTIFICATES")}
                className="text-phosphor-green hover:underline flex items-center gap-0.5 font-bold"
              >
                CERTS &rarr;
              </button>
            </div>
          </div>

          {/* Card 4: Encryption & PFS Ratio */}
          <div className="p-3.5 border border-tactical-border bg-tactical-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-tactical-dim uppercase pb-2 border-b border-tactical-border/70">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-phosphor-cyan" />
                ENCRYPTION &amp; FORWARD SECRECY
              </span>
              <span className="text-[10px] text-tactical-dim">RATIO</span>
            </div>
            <div className="py-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-tactical-dim">Encryption Ratio:</span>
                <span className="font-bold text-white tabular-nums">{encryptionRatio}% ({encryptedCount}/{total_sessions})</span>
              </div>
              <div className="w-full h-1.5 bg-black border border-tactical-border">
                <div className="h-full bg-phosphor-cyan transition-all" style={{ width: `${encryptionRatio}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-tactical-dim">PFS Enforcement (ECDHE):</span>
                <span className="font-bold text-white tabular-nums">{pfsRatio}% ({pfsCount}/{total_sessions})</span>
              </div>
              <div className="w-full h-1.5 bg-black border border-tactical-border">
                <div className="h-full bg-phosphor-green transition-all" style={{ width: `${pfsRatio}%` }} />
              </div>
            </div>
            <div className="text-[10px] text-tactical-dim border-t border-tactical-border/60 pt-2">
              RFC 8314 &amp; NIST SP 800-52r2 COMPLIANCE THRESHOLD
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: DISTRIBUTIONS & CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TLS Version Distribution Chart */}
        <div className="h-[280px]">
          <ProtocolChart data={protocol_distribution} />
        </div>

        {/* Cipher Suite Distribution Chart */}
        <div className="h-[280px]">
          <CipherChart data={cipher_distribution} />
        </div>

        {/* Certificate Health Summary Panel */}
        <div className="border border-tactical-border bg-tactical-surface p-4 flex flex-col justify-between h-[280px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-phosphor-cyan" />
                X.509 CERTIFICATE TELEMETRY
              </span>
              <span className="text-[10px] text-tactical-dim">INVENTORY</span>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Total Certificates Inspected:</span>
                <span className="text-white font-bold tabular-nums">{certificate_summary.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Self-Signed Certificates:</span>
                <span className={`font-bold tabular-nums ${certificate_summary.some(c => c.is_self_signed) ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                  {certificate_summary.filter(c => c.is_self_signed).length} Detected
                </span>
              </div>
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Weak Signature (SHA-1/MD5):</span>
                <span className={`font-bold tabular-nums ${certificate_summary.some(c => c.is_weak_signature) ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                  {certificate_summary.filter(c => c.is_weak_signature).length} Detected
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("CERTIFICATES")}
            className="w-full mt-2 py-1.5 border border-phosphor-cyan/50 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 text-phosphor-cyan text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>INSPECT CERTIFICATE INVENTORY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. NEXT SECTION: PRIORITIZED SECURITY FINDINGS */}
      <div className="border border-tactical-border bg-tactical-surface p-4">
        <div className="flex items-center justify-between pb-3 border-b border-tactical-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-phosphor-hazard" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              PRIORITIZED SECURITY FINDINGS ({vulnerabilities.length})
            </span>
          </div>
          <button
            onClick={() => onNavigate("FINDINGS")}
            className="text-xs text-phosphor-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>FULL FINDINGS DIRECTORY</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {vulnerabilities.slice(0, 4).map((v) => {
            const isCrit = v.severity === "critical";
            return (
              <div
                key={v.id}
                className={`p-3 border flex flex-col justify-between ${
                  isCrit
                    ? "border-phosphor-hazard/50 bg-phosphor-hazard/5"
                    : "border-tactical-border bg-black/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 border ${
                        isCrit
                          ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                          : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                      }`}
                    >
                      {v.severity}
                    </span>
                    <span className="text-[10px] text-tactical-dim font-bold">{v.id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight mb-1">{v.title}</h4>
                  <p className="text-[11px] text-tactical-dim leading-relaxed line-clamp-2">
                    {v.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-tactical-border/60 text-[10px] text-tactical-dim flex items-center justify-between">
                  <span>REF: {v.nist_reference || "NIST SP 800-52r2"}</span>
                  <span className="text-tactical-text font-bold">
                    AFFECTS: STREAM #{v.affected_sessions.join(", #")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM SECTION: RECONSTRUCTED EMAIL SESSION MATRIX PREVIEW */}
      <div className="border border-tactical-border bg-tactical-surface p-4">
        <div className="flex items-center justify-between pb-3 border-b border-tactical-border">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-phosphor-green" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              RECONSTRUCTED EMAIL STREAM MATRIX PREVIEW ({sessions.length})
            </span>
          </div>
          <button
            onClick={() => onNavigate("SESSIONS")}
            className="text-xs text-phosphor-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>EXPAND SESSIONS MATRIX</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dense Table Preview */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-[10px] text-tactical-dim uppercase bg-black/40">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">FLOW VECTOR</th>
                <th className="py-2 px-3">PROTOCOL</th>
                <th className="py-2 px-3">TLS VERSION</th>
                <th className="py-2 px-3">CIPHER SUITE</th>
                <th className="py-2 px-3">PFS</th>
                <th className="py-2 px-3 text-right">SCORE</th>
                <th className="py-2 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-border/60">
              {sessions.map((s) => {
                const isCrit = s.session_score < 50 || s.session_severity === "critical";
                return (
                  <tr
                    key={s.session_id}
                    onClick={() => onOpenSessionDetail(s.session_id)}
                    className="hover:bg-tactical-surfaceHover transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 font-bold text-tactical-dim">{s.session_id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white tracking-tight">{s.server_name}</div>
                      <div className="text-[10px] text-tactical-dim">
                        {s.src_ip}:{s.src_port} &rarr; {s.dst_ip}:{s.dst_port}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 border border-tactical-border bg-tactical-elevated font-bold text-[10px] text-phosphor-cyan">
                        {s.protocol}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 border text-[10px] font-bold ${
                          s.tls_version === "TLS 1.3"
                            ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                            : s.tls_version === "TLS 1.2"
                            ? "border-phosphor-cyan text-phosphor-cyan bg-phosphor-cyan/10"
                            : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                        }`}
                      >
                        {s.tls_version || "PLAINTEXT"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[240px] truncate text-[11px] text-tactical-text">
                      {s.cipher_suite_name || "None (Plaintext Fallback)"}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      {s.has_forward_secrecy ? (
                        <span className="text-phosphor-green font-bold">ECDHE</span>
                      ) : (
                        <span className="text-phosphor-hazard font-bold">NO PFS</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                      <span
                        className={`px-1.5 py-0.5 border ${
                          isCrit
                            ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                            : "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                        }`}
                      >
                        {s.session_score} ({s.session_grade})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSessionDetail(s.session_id);
                        }}
                        className="px-2 py-0.5 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-tactical-text hover:text-white text-[10px] font-bold transition-colors"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
