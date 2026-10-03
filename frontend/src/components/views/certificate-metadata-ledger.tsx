"use client";

import { CertificateInfo } from "@/lib/types";

interface CertificateMetadataLedgerProps {
  cert: CertificateInfo;
}

export function CertificateMetadataLedger({ cert }: CertificateMetadataLedgerProps) {
  return (
    <div className="border border-tactical-border/70 divide-y divide-tactical-border/40 text-[14px] bg-tactical-surface/50 font-mono">
      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">SUBJECT COMMON NAME</span>
        <span className="flex-1 text-tactical-text font-bold select-all break-all">{cert.subject_cn}</span>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">ISSUING AUTHORITY</span>
        <span className="flex-1 text-tactical-text font-bold select-all break-all">{cert.issuer_cn}</span>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">VALIDITY WINDOW</span>
        <span className="flex-1 text-tactical-text font-mono">
          {cert.not_before || "N/A"} &rarr; {cert.not_after || "N/A"}
        </span>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">EXPIRATION STATUS</span>
        <div className="flex-1 flex items-center gap-2">
          <span className={`font-bold ${cert.is_expired ? "text-phosphor-hazard" : "text-phosphor-green"}`}>
            {cert.is_expired ? `EXPIRED (${Math.abs(cert.days_remaining)} days ago)` : "VALID (Active Window)"}
          </span>
          <span className="text-[12px] text-tactical-dim">
            ({cert.validity_days} total days validity)
          </span>
        </div>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">SIGNATURE ALGORITHM</span>
        <span className={`flex-1 font-bold ${cert.is_weak_signature ? "text-phosphor-hazard" : "text-tactical-text"}`}>
          {cert.signature_algorithm || cert.signature_hash}
          {cert.is_weak_signature && " [WEAK CRYPTOGRAPHIC HASH]"}
        </span>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">PUBLIC KEY SPEC</span>
        <span className={`flex-1 font-bold ${cert.is_weak_key ? "text-phosphor-hazard" : "text-tactical-text"}`}>
          {cert.public_key_type} {cert.public_key_bits} bits
          {cert.is_weak_key && " [WEAK KEY LENGTH < 2048b]"}
        </span>
      </div>

      <div className="flex items-center px-4 py-3">
        <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold">SELF-SIGNED STATUS</span>
        <span className={`flex-1 font-bold ${cert.is_self_signed ? "text-phosphor-amber" : "text-tactical-text"}`}>
          {cert.is_self_signed ? "SELF-SIGNED LEAF (UNTRUSTED ROOT)" : "CA SIGNED CERTIFICATE"}
        </span>
      </div>

      {cert.san_entries?.length > 0 && (
        <div className="flex items-start px-4 py-3">
          <span className="w-52 text-[12px] uppercase tracking-wider text-tactical-dim font-bold pt-0.5">SUBJECT ALT NAMES (SAN)</span>
          <div className="flex-1 flex flex-wrap gap-1.5">
            {cert.san_entries.map((san, i) => (
              <span key={i} className="px-2.5 py-1 bg-tactical-surfaceHover border border-tactical-border text-tactical-text text-[12px]">
                {san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
