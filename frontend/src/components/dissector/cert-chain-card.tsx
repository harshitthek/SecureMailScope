"use client";

import { CertificateInfo } from "@/lib/types";
import { Key } from "lucide-react";

interface CertChainCardProps {
  certificate: CertificateInfo | null;
}

export function CertChainCard({ certificate }: CertChainCardProps) {
  return (
    <div className="border border-tactical-border bg-black/40 p-3 space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-tactical-border/70 text-white font-bold">
        <div className="flex items-center gap-1.5 text-phosphor-cyan">
          <Key className="w-3.5 h-3.5" />
          <span>X.509 CERTIFICATE CHAIN</span>
        </div>
        <span className="text-[9px] uppercase px-1 py-0.2 border border-tactical-border text-tactical-dim">
          PKI
        </span>
      </div>

      {certificate ? (
        <div className="space-y-1.5 text-[11px] text-tactical-dim">
          <div>
            <span className="text-[9px] uppercase text-tactical-muted block">Subject Common Name</span>
            <span className="text-white font-bold break-all">{certificate.subject_cn}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-tactical-muted block">Certificate Authority (Issuer)</span>
            <span className="text-tactical-text break-all">{certificate.issuer_cn}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-tactical-border/40">
            <div>
              <span className="text-[9px] uppercase text-tactical-muted block">Key Spec</span>
              <span className="text-tactical-text font-bold">
                {certificate.public_key_type} {certificate.public_key_bits}-bit
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-tactical-muted block">Validity</span>
              <span className={certificate.is_expired ? "text-phosphor-hazard font-bold" : "text-phosphor-green font-bold"}>
                {certificate.is_expired ? "EXPIRED" : `${certificate.days_remaining}d remaining`}
              </span>
            </div>
          </div>
          {certificate.is_self_signed && (
            <div className="p-1 border border-phosphor-hazard/40 bg-phosphor-hazard/10 text-phosphor-hazard text-[10px]">
              [WARN] Self-signed untrusted root certificate
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-tactical-muted text-[11px]">
          No TLS Certificate negotiated (Cleartext transport or stripped STARTTLS)
        </div>
      )}
    </div>
  );
}
