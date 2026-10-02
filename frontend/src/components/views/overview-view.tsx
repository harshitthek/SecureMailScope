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
  ShieldCheck,
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
    <div className="p-4 lg:p-6 space-y-6 max-w-[1680px] mx-auto w-full select-none">
      {/* 1. TOP SECTION: EXECUTIVE POSTURE & BLUEPRINT KPI TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Posture Score Dial (lg:col-span-4) */}
        <div className="lg:col-span-4 h-full min-h-[280px]">
          <PostureDial
            score={enterprise_score}
            grade={enterprise_grade}
            caseCode={caseCode}
          />
        </div>

        {/* 4 Blueprint Telemetry Cells (lg:col-span-8) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-tactical-border border border-tactical-border">
          {/* Cell 1: Session & Wire Packet Telemetry */}
          <div className="bg-tactical-surface p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border/70 text-xs font-mono uppercase">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-phosphor-cyan" />
                SESSIONS &amp; WIRE PACKETS
              </span>
              <span className="text-[10px] text-tactical-dim font-bold">PORT MAPPING</span>
            </div>
            <div className="py-3 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-mono font-black text-white tabular-nums">
                  {total_sessions}
                </span>
                <span className="text-xs font-mono text-tactical-dim ml-2 font-bold uppercase">STREAMS</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-phosphor-cyan tabular-nums">
                  {total_packets}
                </span>
                <span className="text-[10px] font-mono text-tactical-dim ml-1.5">PKTS</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-tactical-dim border-t border-tactical-border/60 pt-2.5 flex items-center justify-between">
              <span>PORTS: 25, 587, 465, 143, 993, 110, 995</span>
              <button
                onClick={() => onNavigate("SESSIONS")}
                className="text-phosphor-cyan hover:underline flex items-center gap-1 font-bold text-xs"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cell 2: Threat & Vulnerability Audit */}
          <div className="bg-tactical-surface p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border/70 text-xs font-mono uppercase">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-phosphor-hazard" />
                SECURITY VULNERABILITIES
              </span>
              <span className="text-[10px] text-tactical-dim font-bold">SEVERITY AUDIT</span>
            </div>
            <div className="py-3 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-mono font-black text-phosphor-hazard tabular-nums">
                  {critVulns}
                </span>
                <span className="text-xs font-mono text-tactical-dim ml-2 font-bold uppercase">CRITICAL</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-phosphor-amber tabular-nums">
                  {highVulns}
                </span>
                <span className="text-[10px] font-mono text-tactical-dim ml-1.5">HIGH</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-tactical-dim border-t border-tactical-border/60 pt-2.5 flex items-center justify-between">
              <span>TOTAL FINDINGS: <strong className="text-white tabular-nums">{vulnerabilities.length}</strong></span>
              <button
                onClick={() => onNavigate("FINDINGS")}
                className="text-phosphor-hazard hover:underline flex items-center gap-1 font-bold text-xs"
              >
                <span>TRIAGE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cell 3: Certificate Health */}
          <div className="bg-tactical-surface p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border/70 text-xs font-mono uppercase">
              <span className="font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-phosphor-green" />
                X.509 CERTIFICATE HEALTH
              </span>
              <span className="text-[10px] text-tactical-dim font-bold">PKI AUDIT</span>
            </div>
            <div className="py-3 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-mono font-black text-phosphor-green tabular-nums">
                  {certHealth.valid}
                </span>
                <span className="text-xs font-mono text-tactical-dim ml-2 font-bold uppercase">VALID</span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-mono font-bold tabular-nums ${certHealth.expired > 0 ? "text-phosphor-hazard" : "text-tactical-dim"}`}>
                  {certHealth.expired}
                </span>
                <span className="text-[10px] font-mono text-tactical-dim ml-1.5">EXPIRED</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-tactical-dim border-t border-tactical-border/60 pt-2.5 flex items-center justify-between">
              <span>WEAK KEYS (&lt;2048b): <strong className="text-white tabular-nums">{certHealth.weakKey}</strong></span>
              <button
                onClick={() => onNavigate("CERTIFICATES")}
                className="text-phosphor-green hover:underline flex items-center gap-1 font-bold text-xs"
              >
                <span>CERTS</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cell 4: Encryption & PFS Ratio */}
          <div className="bg-tactical-surface p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-tactical-border/70 text-xs font-mono uppercase">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-phosphor-cyan" />
                ENCRYPTION &amp; FORWARD SECRECY
              </span>
              <span className="text-[10px] text-tactical-dim font-bold">RFC 8314</span>
            </div>
            <div className="py-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-tactical-dim">Wire Encryption:</span>
                <span className="font-bold text-white tabular-nums">{encryptionRatio}% ({encryptedCount}/{total_sessions})</span>
              </div>
              <div className="w-full h-1.5 bg-black border border-tactical-border">
                <div className="h-full bg-phosphor-cyan transition-all" style={{ width: `${encryptionRatio}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs font-mono pt-0.5">
                <span className="text-tactical-dim">PFS Enforcement (ECDHE):</span>
                <span className="font-bold text-white tabular-nums">{pfsRatio}% ({pfsCount}/{total_sessions})</span>
              </div>
              <div className="w-full h-1.5 bg-black border border-tactical-border">
                <div className="h-full bg-phosphor-green transition-all" style={{ width: `${pfsRatio}%` }} />
              </div>
            </div>
            <div className="text-[10px] font-mono text-tactical-dim border-t border-tactical-border/60 pt-2 flex items-center justify-between">
              <span>NIST SP 800-52r2 COMPLIANCE THRESHOLD</span>
              <span className={pfsRatio >= 80 ? "text-phosphor-green font-bold" : "text-phosphor-amber font-bold"}>
                {pfsRatio >= 80 ? "SATISFIED" : "DEFICIENT"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: PROTOCOL DISTRIBUTIONS & CERTIFICATE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TLS Version Distribution Chart */}
        <div className="h-[290px]">
          <ProtocolChart data={protocol_distribution} />
        </div>

        {/* Cipher Suite Distribution Chart */}
        <div className="h-[290px]">
          <CipherChart data={cipher_distribution} />
        </div>

        {/* Certificate Health Summary Panel */}
        <div className="border border-tactical-border bg-tactical-surface p-4 flex flex-col justify-between h-[290px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-tactical-border text-xs font-mono uppercase font-bold text-white">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-phosphor-cyan" />
                X.509 CERTIFICATE TELEMETRY
              </span>
              <span className="text-[10px] text-tactical-dim font-bold">INVENTORY</span>
            </div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Total Leaf Certs Dissected:</span>
                <span className="text-white font-bold tabular-nums">{certificate_summary.length}</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Self-Signed Root Certificates:</span>
                <span className={`font-bold tabular-nums ${certificate_summary.some(c => c.is_self_signed) ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                  {certificate_summary.filter(c => c.is_self_signed).length} Detected
                </span>
              </div>
              <div className="flex items-center justify-between p-2 border border-tactical-border bg-black/40">
                <span className="text-tactical-dim">Weak Signatures (SHA-1/MD5):</span>
                <span className={`font-bold tabular-nums ${certificate_summary.some(c => c.is_weak_signature) ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                  {certificate_summary.filter(c => c.is_weak_signature).length} Detected
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("CERTIFICATES")}
            className="w-full mt-3 py-2 border border-phosphor-cyan/60 bg-phosphor-cyan/10 hover:bg-phosphor-cyan/20 active:translate-y-[1px] text-phosphor-cyan text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>INSPECT CERTIFICATE INVENTORY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. PRIORITIZED SECURITY FINDINGS */}
      <div className="border border-tactical-border bg-tactical-surface p-4">
        <div className="flex items-center justify-between pb-3 border-b border-tactical-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-phosphor-hazard" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              PRIORITIZED SECURITY FINDINGS ({vulnerabilities.length})
            </span>
          </div>
          <button
            onClick={() => onNavigate("FINDINGS")}
            className="text-xs font-mono text-phosphor-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>FULL FINDINGS DIRECTORY</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Blueprint Grid of Security Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-tactical-border border border-tactical-border mt-3">
          {vulnerabilities.slice(0, 4).map((v) => {
            const isCrit = v.severity === "critical";
            return (
              <div
                key={v.id}
                className="bg-tactical-surface p-4 flex flex-col justify-between hover:bg-tactical-surfaceHover transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                        isCrit
                          ? "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
                          : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
                      }`}
                    >
                      {v.severity}
                    </span>
                    <span className="text-[10px] text-tactical-dim font-bold">{v.id}</span>
                  </div>
                  <h4 className="text-sm font-sans font-bold text-white tracking-tight mb-1.5">
                    {v.title}
                  </h4>
                  <p className="text-xs font-sans text-tactical-text leading-relaxed line-clamp-2">
                    {v.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-tactical-border/60 text-[11px] font-mono text-tactical-dim flex items-center justify-between">
                  <span>REF: {v.nist_reference || "NIST SP 800-52r2"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-tactical-text font-bold">
                      AFFECTS: STREAM #{v.affected_sessions.join(", #")}
                    </span>
                    <button
                      onClick={() => onOpenSessionDetail(v.affected_sessions[0])}
                      className="text-phosphor-cyan hover:underline font-bold text-xs"
                    >
                      [INSPECT]
                    </button>
                  </div>
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
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              RECONSTRUCTED EMAIL STREAM MATRIX PREVIEW ({sessions.length} ACTIVE FLOWS)
            </span>
          </div>
          <button
            onClick={() => onNavigate("SESSIONS")}
            className="text-xs font-mono text-phosphor-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>EXPAND FULL SESSIONS MATRIX</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dense Table Preview */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-[10px] text-tactical-dim uppercase bg-black/50">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4 min-w-[260px]">FLOW VECTOR (SRC ➔ DST)</th>
                <th className="py-2.5 px-3">PROTOCOL</th>
                <th className="py-2.5 px-3">TLS VERSION</th>
                <th className="py-2.5 px-3 min-w-[240px]">CIPHER SUITE</th>
                <th className="py-2.5 px-3">PFS</th>
                <th className="py-2.5 px-3 text-right">SCORE</th>
                <th className="py-2.5 px-3 text-center">ACTION</th>
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
                    <td className="py-2.5 px-3 text-center font-bold text-tactical-dim tabular-nums">
                      #{s.session_id}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-white tracking-tight">{s.server_name}</div>
                      <div className="text-[10px] text-tactical-dim mt-0.5">
                        {s.src_ip}:{s.src_port} &rarr; {s.dst_ip}:{s.dst_port}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 border border-tactical-border bg-tactical-elevated font-bold text-[10px] text-phosphor-cyan">
                        {s.protocol}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 border text-[10px] font-bold ${
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
                    <td className="py-2.5 px-3 max-w-[260px] truncate text-[11px] text-tactical-text font-bold">
                      {s.cipher_suite_name || "None (Plaintext Fallback)"}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      {s.has_forward_secrecy ? (
                        <span className="text-phosphor-green font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 inline" />
                          ECDHE
                        </span>
                      ) : (
                        <span className="text-phosphor-hazard font-bold">NO PFS</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                      <span
                        className={`px-2 py-0.5 border text-xs ${
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
                        className="px-2.5 py-1 border border-tactical-border bg-tactical-elevated hover:border-phosphor-cyan text-tactical-text hover:text-white text-[10px] font-bold transition-all active:translate-y-[1px]"
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
