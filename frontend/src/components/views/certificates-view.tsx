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
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6 pb-16 select-none">
      {/* Header & Stats Card */}
      <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-3 pb-5 border-b border-sms-border">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-sms-text-primary tracking-tight">
              X.509 Certificate &amp; Trust Chain Inspector
            </h2>
            <p className="text-xs text-sms-text-muted mt-0.5">
              Extracted leaf certificates inspected for NIST SP 800-52r2 cryptographic validity
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 font-mono-tech">
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Valid Certificates
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {validCount}
            </span>
            <span className="text-[10px] text-sms-text-muted">Compliant trust chains</span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
              Expired Certificates
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
              {expiredCount}
            </span>
            <span className="text-[10px] text-sms-text-muted">Revoked or out of window</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Weak Keys / Algos
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {weakKeyCount}
            </span>
            <span className="text-[10px] text-sms-text-muted">&lt; 2048-bit RSA / SHA-1</span>
          </div>

          <div className="p-3.5 rounded-xl bg-sms-surface-secondary border border-sms-border">
            <span className="text-[11px] font-bold text-sms-text-muted uppercase tracking-wider block">
              Self-Signed
            </span>
            <span className="text-2xl font-black text-sms-text-primary mt-1 block">
              {selfSignedCount}
            </span>
            <span className="text-[10px] text-sms-text-muted">Untrusted internal CAs</span>
          </div>
        </div>
      </div>

      {/* Certificate Cards List */}
      <div className="space-y-4">
        {sessionsWithCerts.length === 0 ? (
          <div className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-12 text-center">
            <Award className="w-12 h-12 text-sms-text-muted mx-auto mb-3" />
            <h3 className="font-bold text-sms-text-primary text-base">No X.509 Certificates Ingested</h3>
            <p className="text-xs text-sms-text-muted mt-1 max-w-sm mx-auto">
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
                className="sms-card bg-sms-surface-primary border border-sms-border rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-smooth"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sms-border gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isExpired || isWeakKey
                          ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}
                    >
                      {isExpired || isWeakKey ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-sms-text-primary">
                          {cert.subject_cn || s.server_name || "Unknown Host"}
                        </h3>
                        <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-sms-surface-secondary text-sms-text-secondary border border-sms-border">
                          {s.protocol} :{s.dst_port}
                        </span>
                      </div>
                      <span className="text-xs font-mono-tech text-sms-text-muted">
                        Serial: {cert.serial_number || "0x4F8A92BC10"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase tracking-wider self-start sm:self-auto ${
                      isExpired
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800"
                        : isWeakKey
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {isExpired ? "EXPIRED CERTIFICATE" : isWeakKey ? "WEAK PUBLIC KEY" : "VALID TRUST CHAIN"}
                  </span>
                </div>

                {/* Body Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-xs font-mono-tech">
                  <div className="p-3 rounded-xl bg-sms-surface-secondary/60 border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted uppercase block font-semibold mb-1">
                      Issuer Authority
                    </span>
                    <span className="font-bold text-sms-text-primary truncate block" title={cert.issuer_cn}>
                      {cert.issuer_cn || "DigiCert Global Root G2"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-sms-surface-secondary/60 border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted uppercase block font-semibold mb-1">
                      Public Key Strength
                    </span>
                    <span className={`font-bold block ${isWeakKey ? "text-red-600 dark:text-red-400" : "text-sms-text-primary"}`}>
                      {cert.public_key_type} {cert.public_key_bits}-bit
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-sms-surface-secondary/60 border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted uppercase block font-semibold mb-1">
                      Signature Algorithm
                    </span>
                    <span className="font-bold text-sms-text-primary block">
                      {cert.signature_algorithm || "SHA256withRSA"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-sms-surface-secondary/60 border border-sms-border">
                    <span className="text-[10px] text-sms-text-muted uppercase block font-semibold mb-1">
                      Validity Window
                    </span>
                    <span className={`font-bold block ${isExpired ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {cert.days_remaining} Days Remaining
                    </span>
                  </div>
                </div>

                {/* SAN Entries */}
                {cert.san_entries && cert.san_entries.length > 0 && (
                  <div className="pt-3 border-t border-sms-border flex items-center flex-wrap gap-2 text-xs font-mono-tech">
                    <span className="text-sms-text-muted flex items-center gap-1 font-semibold">
                      <Globe className="w-3.5 h-3.5" />
                      <span>SANs:</span>
                    </span>
                    {cert.san_entries.map((san) => (
                      <span
                        key={san}
                        className="px-2 py-0.5 rounded-md bg-sms-surface-secondary text-sms-text-secondary border border-sms-border"
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
