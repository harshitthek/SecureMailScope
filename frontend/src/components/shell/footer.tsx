"use client";

import React from "react";
import { Shield } from "lucide-react";

export function ApplicationFooter() {
  return (
    <footer className="w-full border-t border-[#1c1d22] bg-[#08080a] mt-auto py-12 select-none font-sans">
      <div className="max-w-[1216px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Column 1: Brand & Sensor Lockup */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#121317] border border-[#2e3038] flex items-center justify-center text-[#cc9166]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif text-lg text-white font-normal">
                SecureMailScope
              </span>
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-[#cc9166] uppercase block font-mono">
              NTRO FORENSIC INTELLIGENCE · SIH26159
            </span>
            <p className="text-[#9194a1] leading-relaxed max-w-sm">
              Passive network forensic analyzer for automated email cryptographic security posture assessment across enterprise SMTP, IMAP, and POP3 network boundaries.
            </p>
          </div>

          {/* Column 2: Protocols */}
          <div className="space-y-2.5">
            <span className="text-white font-medium uppercase tracking-wider text-[11px] block font-mono">
              Email Protocols
            </span>
            <ul className="space-y-1.5 text-[#9194a1]">
              <li>SMTP / Submission (:25/:587)</li>
              <li>SMTPS Implicit TLS (:465)</li>
              <li>IMAP4 / IMAPS (:143/:993)</li>
              <li>POP3 / POP3S (:110/:995)</li>
              <li>TCP Stream Reassembly</li>
            </ul>
          </div>

          {/* Column 3: Standards */}
          <div className="space-y-2.5">
            <span className="text-white font-medium uppercase tracking-wider text-[11px] block font-mono">
              Audit Standards
            </span>
            <ul className="space-y-1.5 text-[#9194a1]">
              <li>NIST SP 800-52r2</li>
              <li>IETF RFC 8314</li>
              <li>JA3 Fingerprinting</li>
              <li>X.509 Trust Chains</li>
              <li>AEAD Cryptographic Suite</li>
            </ul>
          </div>

          {/* Column 4: Operational Security */}
          <div className="space-y-2.5">
            <span className="text-white font-medium uppercase tracking-wider text-[11px] block font-mono">
              Sensor Telemetry
            </span>
            <ul className="space-y-1.5 text-[#9194a1]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span>TAP-01 Hardware Mirror</span>
              </li>
              <li>Air-Gapped Pipeline</li>
              <li>Zero Cloud Exfiltration</li>
              <li>Raw PCAP Frame Dissector</li>
              <li>Official PDF Attestation</li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Ledger Line */}
        <div className="pt-8 mt-8 border-t border-[#1c1d22] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777a88] gap-3">
          <div>
            © 2026 National Technical Research Organisation (NTRO) · Smart India Hackathon
          </div>
          <div className="flex items-center gap-2 text-[#9194a1]">
            <span className="text-[#cc9166]">SIH26159</span>
            <span>·</span>
            <span>Passive Email Cryptographic Posture System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
