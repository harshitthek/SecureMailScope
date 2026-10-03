"use client";

import { CertificateInfo } from "@/lib/types";

interface SessionDetailCertTabProps {
  cert: CertificateInfo | null | undefined;
}

export function SessionDetailCertTab({ cert }: SessionDetailCertTabProps) {
  return (
    <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-tactical-border pb-2 text-xs">
        <span className="font-bold text-tactical-text uppercase">X.509 SERVER CERTIFICATE INSPECTION</span>
        <span className="text-[10px] text-tactical-dim italic">
          Cryptographic properties verified from leaf certificate. CA trust chain not asserted.
        </span>
      </div>

      {cert ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Subject Common Name (CN)</span>
              <div className="text-sm font-bold text-tactical-text break-all">{cert.subject_cn}</div>
            </div>

            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Issuer Common Name (CA)</span>
              <div className="text-xs font-bold text-tactical-text break-all">{cert.issuer_cn}</div>
            </div>

            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Validity Window</span>
              <div className="text-xs text-tactical-text">
                <div>Not Before: {cert.not_before}</div>
                <div>Not After: {cert.not_after}</div>
                <div className={`mt-1 font-bold ${cert.is_expired ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
                  {cert.is_expired ? `EXPIRED (${cert.days_remaining} days)` : `VALID (${cert.days_remaining} days remaining)`}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Public Key &amp; Size</span>
              <div className="text-sm font-bold text-tactical-text">
                {cert.public_key_type} {cert.public_key_bits}-bit
              </div>
              <div className={cert.is_weak_key ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                {cert.is_weak_key ? "✗ WEAK KEY: Below 2048-bit minimum requirements" : "✓ Meets NIST minimum key length"}
              </div>
            </div>

            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Signature Algorithm</span>
              <div className="text-xs font-bold text-tactical-text">{cert.signature_algorithm}</div>
              <div className={cert.is_weak_signature ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                {cert.is_weak_signature ? "✗ DEPRECATED HASH (MD5/SHA-1)" : `✓ Secure Hash (${cert.signature_hash})`}
              </div>
            </div>

            <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1">
              <span className="text-[10px] uppercase text-tactical-dim font-bold block">Self-Signed Status</span>
              <div className={cert.is_self_signed ? "text-phosphor-hazard font-bold text-xs" : "text-phosphor-green font-bold text-xs"}>
                {cert.is_self_signed ? "✗ Self-signed leaf certificate" : "✓ Third-party issued certificate"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-tactical-dim border border-tactical-border">
          No X.509 certificate was negotiated in this session (unencrypted or incomplete handshake).
        </div>
      )}
    </div>
  );
}
