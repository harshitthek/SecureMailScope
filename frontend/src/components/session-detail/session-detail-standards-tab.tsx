"use client";

import { Session } from "@/lib/types";

interface SessionDetailStandardsTabProps {
  session: Session;
}

export function SessionDetailStandardsTab({
  session,
}: SessionDetailStandardsTabProps) {
  const isTlsPass = session.tls_version === "TLS 1.3" || session.tls_version === "TLS 1.2";
  const isImplicitPass = [465, 993, 995].includes(session.dst_port);

  return (
    <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
      <div className="border-b border-tactical-border pb-2 text-xs font-bold text-tactical-text uppercase">
        STATUTORY COMPLIANCE AUDIT MAPPING
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Rule 1: NIST SP 800-52r2 TLS Version */}
        <div className="p-3 border border-tactical-border bg-tactical-surface flex items-center justify-between">
          <div>
            <span className="font-bold text-tactical-text block">NIST SP 800-52r2 Section 3.2.1: TLS Protocol Version</span>
            <span className="text-tactical-dim text-[11px]">Minimum TLS 1.2 required. TLS 1.0/1.1 and SSL prohibited.</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 border text-xs ${
              isTlsPass
                ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
            }`}
          >
            {isTlsPass ? "PASS" : "FAIL"}
          </span>
        </div>

        {/* Rule 2: Ephemeral Forward Secrecy */}
        <div className="p-3 border border-tactical-border bg-tactical-surface flex items-center justify-between">
          <div>
            <span className="font-bold text-tactical-text block">NIST SP 800-52r2 Section 3.3.1: Perfect Forward Secrecy</span>
            <span className="text-tactical-dim text-[11px]">ECDHE or DHE key exchange mandatory. Static RSA prohibited.</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 border text-xs ${
              session.has_forward_secrecy
                ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                : "border-phosphor-hazard text-phosphor-hazard bg-phosphor-hazard/10"
            }`}
          >
            {session.has_forward_secrecy ? "PASS" : "FAIL"}
          </span>
        </div>

        {/* Rule 3: RFC 8314 Implicit TLS */}
        <div className="p-3 border border-tactical-border bg-tactical-surface flex items-center justify-between">
          <div>
            <span className="font-bold text-tactical-text block">RFC 8314 Section 3: Implicit TLS Mandate</span>
            <span className="text-tactical-dim text-[11px]">Opportunistic STARTTLS discouraged; dedicated ports (465/993/995) required.</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 border text-xs ${
              isImplicitPass
                ? "border-phosphor-green text-phosphor-green bg-phosphor-green/10"
                : "border-phosphor-amber text-phosphor-amber bg-phosphor-amber/10"
            }`}
          >
            {isImplicitPass ? "PASS" : "WARN (EXPLICIT)"}
          </span>
        </div>
      </div>
    </div>
  );
}
