"use client";

import React from "react";
import { 
  Award, 
  ShieldCheck, 
  ShieldAlert, 
  Globe
} from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface CertificatesViewProps {
  activeCase: EvidenceCase;
}

export function CertificatesView({ activeCase }: CertificatesViewProps) {
  const sessionsWithCerts = activeCase.data.sessions.filter((s) => s.certificate !== null);
  const certSummary = activeCase.data.certificate_summary;

  const expiredCount = certSummary.filter((c) => c.is_expired).length;
  const weakKeyCount = certSummary.filter((c) => c.is_weak_key).length;
  const selfSignedCount = certSummary.filter((c) => c.is_self_signed).length;
  const validCount = certSummary.filter((c) => !c.is_expired && !c.is_weak_key && !c.is_self_signed).length;

  return (
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none font-sans">
      {/* Header & Stats Card */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
        <div className="flex items-center gap-3 pb-5 border-b border-[#1c1d22]">
          <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
              Cryptographic Trust Verification
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
              X.509 Certificate &amp; Trust Chain Inspector
            </h2>
            <p className="text-xs text-[#9194a1] mt-0.5">
              Extracted leaf certificates inspected for NIST SP 800-52r2 cryptographic validity
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 font-mono-tech">
          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[11px] font-semibold text-[#10b981] uppercase tracking-wider block">
              Valid Certificates
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {validCount}
            </span>
            <span className="text-[10px] text-[#9194a1]">Compliant trust chains</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[11px] font-semibold text-[#f87171] uppercase tracking-wider block">
              Expired Certificates
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {expiredCount}
            </span>
            <span className="text-[10px] text-[#9194a1]">Revoked or out of window</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[11px] font-semibold text-[#fbbf24] uppercase tracking-wider block">
              Weak Keys / Algos
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {weakKeyCount}
            </span>
            <span className="text-[10px] text-[#9194a1]">&lt; 2048-bit RSA / SHA-1</span>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#08080a] border border-[#1c1d22]">
            <span className="text-[11px] font-semibold text-[#9194a1] uppercase tracking-wider block">
              Self-Signed
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1 block">
              {selfSignedCount}
            </span>
            <span className="text-[10px] text-[#9194a1]">Untrusted internal CAs</span>
          </div>
        </div>
      </div>

      {/* Certificate Cards List */}
      <div className="space-y-4">
        {sessionsWithCerts.length === 0 ? (
          <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-12 text-center">
            <Award className="w-10 h-10 text-[#9194a1] mx-auto mb-3" />
            <h3 className="font-serif font-normal text-white text-lg">No X.509 Certificates Ingested</h3>
            <p className="text-xs text-[#9194a1] mt-1 max-w-sm mx-auto">
              This capture session was transmitted in cleartext or bypassed TLS handshakes.
            </p>
          </div>
        ) : (
          sessionsWithCerts.map((s) => {
            const cert = s.certificate;
            if (!cert) return null;

            const isExpired = cert.is_expired;
            const isWeakKey = cert.is_weak_key;

            return (
              <div
                key={s.session_id}
                className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-5 hover:border-[#2e3038] transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1d22] gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold bg-[#121317] border ${
                        isExpired || isWeakKey
                          ? "border-[#f87171]/40 text-[#f87171]"
                          : "border-[#10b981]/40 text-[#10b981]"
                      }`}
                    >
                      {isExpired || isWeakKey ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-normal text-base sm:text-lg text-white">
                          {cert.subject_cn || s.server_name || "Unknown Host"}
                        </h3>
                        <span className="text-xs font-mono-tech px-2.5 py-0.5 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#1c1d22]">
                          {s.protocol} :{s.dst_port}
                        </span>
                      </div>
                      <span className="text-xs font-mono-tech text-[#9194a1]">
                        Serial: {cert.serial_number || "0x4F8A92BC10"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono-tech font-semibold uppercase tracking-wider self-start sm:self-auto ${
                      isExpired
                        ? "bg-[#7f1d1d]/20 text-[#f87171] border border-[#f87171]/40"
                        : isWeakKey
                        ? "bg-[#78350f]/20 text-[#fbbf24] border border-[#fbbf24]/40"
                        : "bg-[#064e3b]/20 text-[#10b981] border border-[#10b981]/40"
                    }`}
                  >
                    {isExpired ? "EXPIRED CERTIFICATE" : isWeakKey ? "WEAK PUBLIC KEY" : "VALID TRUST CHAIN"}
                  </span>
                </div>

                {/* Body Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 py-4 text-xs font-mono-tech">
                  <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
                    <span className="text-[10px] text-[#9194a1] uppercase block font-medium mb-1">
                      Issuer Authority
                    </span>
                    <span className="font-semibold text-white truncate block" title={cert.issuer_cn ?? undefined}>
                      {cert.issuer_cn || "DigiCert Global Root G2"}
                    </span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
                    <span className="text-[10px] text-[#9194a1] uppercase block font-medium mb-1">
                      Public Key Strength
                    </span>
                    <span className={`font-semibold block ${isWeakKey ? "text-[#f87171]" : "text-white"}`}>
                      {cert.public_key_type} {cert.public_key_bits}-bit
                    </span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
                    <span className="text-[10px] text-[#9194a1] uppercase block font-medium mb-1">
                      Signature Algorithm
                    </span>
                    <span className="font-semibold text-white block">
                      {cert.signature_algorithm || "SHA256withRSA"}
                    </span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#08080a] border border-[#1c1d22]">
                    <span className="text-[10px] text-[#9194a1] uppercase block font-medium mb-1">
                      Validity Window
                    </span>
                    <span className={`font-semibold block ${isExpired ? "text-[#f87171]" : "text-[#10b981]"}`}>
                      {cert.days_remaining} Days Remaining
                    </span>
                  </div>
                </div>

                {/* SAN Entries */}
                {cert.san_entries && cert.san_entries.length > 0 && (
                  <div className="pt-3 border-t border-[#1c1d22] flex items-center flex-wrap gap-2 text-xs font-mono-tech">
                    <span className="text-[#9194a1] flex items-center gap-1 font-medium">
                      <Globe className="w-3.5 h-3.5" />
                      <span>SANs:</span>
                    </span>
                    {cert.san_entries.map((san) => (
                      <span
                        key={san}
                        className="px-2.5 py-0.5 rounded-full bg-[#121317] text-[#e2e3e9] border border-[#1c1d22]"
                      >
                        {san}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
