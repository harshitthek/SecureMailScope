"use client";

import React, { useState } from "react";
import { 
  Binary, 
  Terminal, 
  Cpu
} from "lucide-react";
import { EvidenceCase } from "@/lib/types";

interface DissectorViewProps {
  activeCase: EvidenceCase;
  initialStreamId?: number;
}

const formatPenalty = (val: number | undefined) => {
  const absVal = Math.abs(val || 0);
  if (absVal === 0) {
    return { text: "0 pts", color: "text-[#9194a1]" };
  }
  return { text: `-${absVal} pts`, color: "text-[#f87171]" };
};

export function DissectorView({ activeCase, initialStreamId }: DissectorViewProps) {
  const [selectedStreamId, setSelectedStreamId] = useState<number>(
    initialStreamId || activeCase.data.sessions[0]?.session_id || 1
  );
  const [mode, setMode] = useState<"AUDIT" | "RAW">("AUDIT");

  const session = activeCase.data.sessions.find((s) => s.session_id === selectedStreamId) || activeCase.data.sessions[0];

  const isSecure = session.session_score >= 80;

  const protoP = formatPenalty(session.scoring_breakdown.protocol_penalty);
  const cipherP = formatPenalty(session.scoring_breakdown.cipher_penalty);
  const pfsP = formatPenalty(session.scoring_breakdown.pfs_penalty);
  const certP = formatPenalty(session.scoring_breakdown.cert_penalty);
  const anomalyP = formatPenalty(session.scoring_breakdown.anomaly_penalty);


  return (
    <main className="flex-1 w-full max-w-[1216px] mx-auto px-6 py-4 flex flex-col gap-6 pb-20 select-none font-sans">
      {/* Header & Mode Switcher */}
      <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#1c1d22] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#121317] border border-[#2e3038] text-[#cc9166] flex items-center justify-center font-bold">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-[-0.02em] text-[#cc9166] uppercase block">
                Deep Packet Protocol Dissector
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-[0.01em]">
                Wire Analysis &amp; Handshake Disassembly
              </h2>
              <p className="text-xs text-[#9194a1] mt-0.5">
                Low-level wire analysis, TLS handshake record tree, and ASCII/Hex stream disassembly
              </p>
            </div>
          </div>

          {/* Mode Selector (Pill group) */}
          <div className="flex items-center gap-1.5 bg-[#121317] p-1 rounded-full border border-[#2e3038]">
            <button
              type="button"
              onClick={() => setMode("AUDIT")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === "AUDIT"
                  ? "bg-white text-black"
                  : "text-[#9194a1] hover:text-white"
              }`}
            >
              Mode A: Cryptanalysis &amp; Audit
            </button>
            <button
              type="button"
              onClick={() => setMode("RAW")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === "RAW"
                  ? "bg-white text-black"
                  : "text-[#9194a1] hover:text-white"
              }`}
            >
              Mode B: Raw Stream &amp; Hex Dump
            </button>
          </div>
        </div>

        {/* Stream Selector Bar */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-[#9194a1] mr-2 shrink-0">
            Select Stream:
          </span>
          {activeCase.data.sessions.map((s, idx) => {
            const isSelected = s.session_id === selectedStreamId;
            const sIsSec = s.session_score >= 80;
            const sIsCrit = s.session_score < 50 || s.starttls_stripped;

            return (
              <button
                key={s.session_id}
                type="button"
                onClick={() => setSelectedStreamId(s.session_id)}
                className={`px-3.5 py-1 rounded-full text-xs font-mono border transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-[#121317] text-white border-[#cc9166]"
                    : "bg-[#040406] text-[#9194a1] border-[#1c1d22] hover:border-[#2e3038] hover:text-white"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sIsSec ? "bg-[#34d399]" : sIsCrit ? "bg-[#f87171]" : "bg-[#cc9166]"
                  }`}
                />
                <span>Flow #{String(idx + 1).padStart(2, "0")}</span>
                <span className="text-[10px] text-[#777a88]">({s.protocol} :{s.dst_port})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dissector Mode Content */}
      {mode === "AUDIT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Handshake Parameter Tree */}
          <div className="lg:col-span-8 bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6">
            <h3 className="text-base font-serif font-normal text-white pb-3 mb-4 border-b border-[#1c1d22] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#cc9166]" />
              <span>TLS Record Layer Handshake Tree</span>
            </h3>

            <div className="space-y-3.5 font-mono text-xs">
              {/* Client Hello Block */}
              <div className="p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c1d22]">
                  <span className="font-semibold text-white uppercase">
                    1. Client Hello (Record 0x16, Version 0x0303)
                  </span>
                  <span className="text-[#9194a1]">SNI: {session.server_name || "N/A"}</span>
                </div>
                <div className="space-y-1.5 text-[#acafb9]">
                  <div>• Source IP &amp; Port: <span className="font-medium text-white">{session.src_ip}:{session.src_port}</span></div>
                  <div>• Supported TLS Versions: <span className="font-medium text-white">TLS 1.3, TLS 1.2, TLS 1.1</span></div>
                  <div>• Key Share Curve: <span className="font-medium text-[#cc9166]">x25519 (ECDH)</span></div>
                  <div>• Signature Algorithms: <span className="font-medium text-white">ecdsa_secp256r1_sha256, rsa_pss_rsae_sha256</span></div>
                </div>
              </div>

              {/* Server Hello Block */}
              <div className="p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1c1d22]">
                  <span className="font-semibold text-[#34d399] uppercase">
                    2. Server Hello &amp; Negotiated Session
                  </span>
                  <span className="text-[#9194a1]">Status: {session.is_encrypted ? "Encrypted" : "Cleartext"}</span>
                </div>
                <div className="space-y-1.5 text-[#acafb9]">
                  <div>• Negotiated Protocol: <span className="font-medium text-white">{session.tls_version || "None"}</span></div>
                  <div>• Selected Cipher Suite: <span className="font-medium text-white">{session.cipher_suite_name || "None"}</span></div>
                  <div>• Perfect Forward Secrecy: <span className={`font-medium ${session.has_forward_secrecy ? "text-[#34d399]" : "text-[#f87171]"}`}>{session.has_forward_secrecy ? "Enforced" : "Disabled"}</span></div>
                  <div>• Target Host Endpoint: <span className="font-medium text-white">{session.dst_ip}:{session.dst_port}</span></div>
                </div>
              </div>

              {/* JA3 Fingerprint Block */}
              <div className="p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22]">
                <span className="font-semibold text-white uppercase block mb-1">
                  3. JA3 Passive Fingerprint Verification
                </span>
                <p className="text-[11px] text-[#9194a1] mb-2 font-sans">
                  MD5 signature generated from TLS Client Hello attributes.
                </p>
                <div className="p-2.5 rounded-full bg-[#040406] border border-[#2e3038] break-all font-medium text-[#cc9166] px-4 text-center">
                  {session.ja3_hash || "e7d705a3286e19ea42f587b344ee6865"}
                </div>
                {session.ja3_client_name && (
                  <div className="mt-2 text-xs font-medium text-[#34d399] text-center">
                    Match Identified: {session.ja3_client_name} (Known Mail Client)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Deduction Ledger */}
          <div className="lg:col-span-4 bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-serif font-normal text-white pb-3 mb-4 border-b border-[#1c1d22]">
                Cryptographic Scoring Ledger
              </h3>

              <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#121317] border border-[#1c1d22] mb-4">
                <span className="text-xs font-mono uppercase text-[#9194a1]">Final Stream Score</span>
                <span className={`text-3xl font-serif ${isSecure ? "text-[#34d399]" : "text-[#f87171]"}`}>
                  {session.session_score}/100
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Base Maximum Score</span>
                  <span className="font-medium text-white">100 pts</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Protocol Version Penalty</span>
                  <span className={`font-serif ${protoP.color}`}>{protoP.text}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Cipher Suite Penalty</span>
                  <span className={`font-serif ${cipherP.color}`}>{cipherP.text}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Forward Secrecy (PFS)</span>
                  <span className={`font-serif ${pfsP.color}`}>{pfsP.text}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Certificate Trust Penalty</span>
                  <span className={`font-serif ${certP.color}`}>{certP.text}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1c1d22]">
                  <span className="text-[#9194a1]">Anomaly / Downgrade</span>
                  <span className={`font-serif ${anomalyP.color}`}>{anomalyP.text}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1c1d22] text-[11px] text-[#777a88]">
              Computed in compliance with NIST Special Publication 800-52 Revision 2 scoring rules.
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Raw Stream & Hex Dump */
        <div className="bg-[#040406] border border-[#1c1d22] rounded-[10px] p-6 font-mono text-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1c1d22]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#cc9166]" />
              <span className="font-medium text-sm text-white">
                Raw Packet Disassembly: TCP Stream #{session.session_id}
              </span>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-[#121317] text-[#9194a1] text-[11px] border border-[#2e3038]">
              ASCII &amp; HEX VIEW
            </span>
          </div>

          <div className="bg-[#08080a] text-[#e2e3e9] p-5 rounded-[10px] overflow-x-auto space-y-2 border border-[#1c1d22] text-[11px] leading-relaxed">
            <div className="text-[#34d399] font-medium mb-3">
              === REASSEMBLED TCP STREAM: {session.src_ip}:{session.src_port} &lt;--&gt; {session.dst_ip}:{session.dst_port} ===
            </div>

            {session.forensic_inspection?.raw_chunks && session.forensic_inspection.raw_chunks.length > 0 ? (
              session.forensic_inspection.raw_chunks.map((chunk, cIdx) => (
                <React.Fragment key={cIdx}>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="text-[#777a88] shrink-0">0x{chunk.offset.padStart(4, "0")}</span>
                    <span className="text-[#e2e3e9] tracking-wider shrink-0">{chunk.hex.padEnd(48, " ")}</span>
                    <span className="text-[#9194a1] shrink-0">|{chunk.ascii}|</span>
                    <span className="text-[#cc9166] text-[10px] shrink-0">[{chunk.direction}]</span>
                    <span className="text-[#777a88] text-[10px] truncate">{chunk.protocol_phase}</span>
                  </div>
                  {chunk.highlight_label && (
                    <div
                      className={`p-2.5 rounded-[8px] my-2 border text-xs font-sans ${
                        chunk.highlight_type === "danger"
                          ? "bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30"
                          : chunk.highlight_type === "warning"
                          ? "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30"
                          : chunk.highlight_type === "secure"
                          ? "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30"
                          : "bg-[#121317] text-[#cc9166] border-[#2e3038]"
                      }`}
                    >
                      <span className="font-semibold block font-mono text-[10px] uppercase">
                        [!] Forensic Wire Transition at Offset 0x{chunk.offset.padStart(4, "0")}:
                      </span>
                      <span className="font-mono text-xs">{chunk.highlight_label}</span>
                    </div>
                  )}
                </React.Fragment>
              ))
            ) : (
              <>
                <div>00000000  32 32 30 20 6d 61 69 6c  2e 63 6f 72 70 2e 6e 65  |220 mail.corp.ne| S-&gt;C</div>
                <div>00000010  74 20 45 53 4d 54 50 20  53 65 72 76 69 63 65 0d  |t ESMTP Service.| S-&gt;C</div>
                <div>00000020  0a 45 48 4c 4f 20 63 6c  69 65 6e 74 2e 6c 6f 63  |.EHLO client.loc| C-&gt;S</div>
                <div>00000030  61 6c 0d 0a 32 35 30 2d  6d 61 69 6c 2e 63 6f 72  |al..250-mail.cor| S-&gt;C</div>
                {session.starttls_stripped ? (
                  <div className="bg-[#f87171]/10 text-[#f87171] p-2.5 rounded-[10px] border border-[#f87171]/30 my-2">
                    <span className="font-semibold block">[!] FORENSIC ANOMALY AT OFFSET 0x00000040:</span>
                    <div>00000040  32 35 30 20 50 49 50 45  4c 49 4e 49 4e 47 0d 0a  |250 PIPELINING..| S-&gt;C</div>
                    <div className="font-semibold mt-1">--&gt; &apos;250-STARTTLS&apos; CAPABILITY STRIPPED BY MITM INTERCEPTOR &lt;--</div>
                  </div>
                ) : (
                  <div className="bg-[#34d399]/10 text-[#34d399] p-2.5 rounded-[10px] border border-[#34d399]/30 my-2">
                    <div>00000040  32 35 30 2d 53 54 41 52  54 54 4c 53 0d 0a        |250-STARTTLS..| S-&gt;C</div>
                    <div className="font-semibold mt-1">--&gt; STARTTLS ADVERTISED &amp; ACCEPTED &lt;--</div>
                  </div>
                )}
                <div>00000050  53 54 41 52 54 54 4c 53  0d 0a 32 32 30 20 32 2e  |STARTTLS..220 2.| C-&gt;S</div>
                <div>00000060  30 2e 30 20 52 65 61 64  79 20 74 6f 20 73 74 61  |0.0 Ready to sta| S-&gt;C</div>
                <div>00000070  72 74 20 54 4c 53 0d 0a  16 03 03 00 c8          |rt TLS...| TLS RECORD</div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
