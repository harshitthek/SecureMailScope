"use client";

import React, { useState, useEffect, useMemo } from "react";
import { EvidenceCase, RemediationSummary, D3fendTechnique } from "@/lib/types";
import { getRemediationSummary } from "@/lib/api";
import { D3fendMatrixGrid } from "./d3fend-matrix-grid";
import { PlaybookRuleInspector } from "./playbook-rule-inspector";
import { Shield, Sparkles } from "lucide-react";

interface RemediationViewProps {
  activeCase: EvidenceCase;
}

export function RemediationView({ activeCase }: RemediationViewProps) {
  const [summary, setSummary] = useState<RemediationSummary | null>(null);

  const fallbackMatrix = useMemo<D3fendTechnique[]>(() => {
    const hasCleartext = activeCase.data.sessions.some((s) => !s.is_encrypted);
    const hasWeakCipher = activeCase.data.sessions.some((s) => s.cipher_severity === "critical" || s.cipher_severity === "high");
    const hasPfs = activeCase.data.sessions.some((s) => s.is_encrypted && !s.has_forward_secrecy);
    const hasCertIssue = activeCase.data.sessions.some((s) => s.certificate?.is_expired || s.certificate?.is_weak_signature || s.certificate?.is_weak_key);

    return [
      {
        technique_id: "D3-OTP",
        name: "Opportunistic Inbound TLS Verification",
        status: hasCleartext ? "CRITICAL" : "COMPLIANT",
        rationale: hasCleartext
          ? "Cleartext SMTP transmission detected without mandatory cryptographic envelope."
          : "MTA actively negotiates encrypted channel via STARTTLS.",
        actions: hasCleartext ? ["Enforce smtpd_tls_security_level = encrypt", "Mandate MTA-STS / DANE TLSA"] : ["Maintain strict TLS requirement"],
      },
      {
        technique_id: "D3-CSD",
        name: "Cipher Suite Deprecation Enforcement",
        status: hasWeakCipher ? "CRITICAL" : "COMPLIANT",
        rationale: hasWeakCipher
          ? "Legacy ciphers (RC4, 3DES, CBC) accepted in active negotiation."
          : "Only modern AEAD ciphers (AES-GCM, ChaCha20-Poly1305) permitted.",
        actions: hasWeakCipher ? ["Disable 3DES and CBC ciphers", "Configure high-strength cipherlist"] : ["Retain current cipher policy"],
      },
      {
        technique_id: "D3-PFS",
        name: "Ephemeral Key Exchange Mandate",
        status: hasPfs ? "HIGH" : "COMPLIANT",
        rationale: hasPfs
          ? "Static RSA key exchange observed. Compromise of private key compromises past traffic."
          : "Ephemeral Diffie-Hellman (ECDHE) utilized with Forward Secrecy.",
        actions: hasPfs ? ["Enable ECDHE curves (X25519, secp256r1)", "Disable static RSA key exchange"] : ["Maintain ECDHE priority"],
      },
      {
        technique_id: "D3-CTA",
        name: "Certificate Trust & Signature Audit",
        status: hasCertIssue ? "HIGH" : "COMPLIANT",
        rationale: hasCertIssue
          ? "Weak signature algorithm or expiration detected on leaf certificate."
          : "Valid X.509 certificate hierarchy with SHA-256 or better.",
        actions: hasCertIssue ? ["Re-issue with SHA-256 or Ed25519", "Automate renewal via ACME / Certbot"] : ["Regularly monitor certificate expiration"],
      },
    ];
  }, [activeCase]);

  useEffect(() => {
    let isCancelled = false;
    const targetId = activeCase.data.analysis_id || activeCase.case_code;

    getRemediationSummary(targetId)
      .then((data) => {
        if (!isCancelled) setSummary(data);
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [activeCase]);

  const techniques = summary?.d3fend_matrix || fallbackMatrix;

  return (
    <div className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1d22] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#cc9166]/10 text-[#cc9166] border border-[#cc9166]/20">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-mono font-bold text-white tracking-tight">
              AUTOMATED REMEDIATION & MITRE D3FEND ORCHESTRATION
            </h1>
          </div>
          <p className="text-xs font-mono text-[#9194a1] mt-1">
            TARGET HOST: <span className="text-[#e2e3e9]">{activeCase.target_host}</span> · CASE: <span className="text-[#cc9166]">{activeCase.label}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#9194a1] bg-[#0c0d10] px-3 py-1.5 rounded border border-[#1c1d22]">
          <Sparkles className="w-3.5 h-3.5 text-[#cc9166]" />
          <span>AUTONOMOUS HARDENING SYNTHESIS</span>
        </div>
      </div>

      <D3fendMatrixGrid techniques={techniques} />

      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#9194a1] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cc9166]" />
          Orchestration Artifacts — Playbooks & IDS Signatures
        </h2>
        <PlaybookRuleInspector analysisId={activeCase.data.analysis_id || activeCase.case_code} />
      </div>
    </div>
  );
}
