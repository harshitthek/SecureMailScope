"use client";

import React from "react";
import { X, ShieldCheck, ShieldAlert, Cpu, Terminal, FileCode, CheckCircle2 } from "lucide-react";

interface Simulation3DPacketInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: number;
  clientIp: string;
  serverIp: string;
  port: number;
  enforceTls13?: boolean;
  enforcePfs?: boolean;
  enforceAead?: boolean;
  renewCerts?: boolean;
}

export function Simulation3DPacketInspector({
  isOpen,
  onClose,
  currentStage,
  clientIp,
  serverIp,
  port,
  enforceTls13 = false,
  enforcePfs = false,
  enforceAead = false,
  renewCerts = false,
}: Simulation3DPacketInspectorProps) {
  if (!isOpen) return null;

  const anyPolicyActive = enforceTls13 || enforcePfs || enforceAead || renewCerts;
  const isHardened = anyPolicyActive && currentStage >= 3;
  const isAttackStage = currentStage === 2;

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-text">
      <div className="bg-[#08090d] border border-[#2e3038] rounded-[10px] w-full max-w-2xl max-h-[90%] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-[#1c1d22] flex items-center justify-between bg-[#0e1017]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#38bdf8]" />
            <span className="text-xs font-bold text-white tracking-wide">
              DEEP WIRE DISSECTOR // IN-FLIGHT PACKET TELEMETRY
            </span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                isHardened
                  ? "bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/40"
                  : isAttackStage
                  ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 animate-pulse"
                  : "bg-[#cc9166]/20 text-[#cc9166] border border-[#cc9166]/40"
              }`}
            >
              {isHardened
                ? enforceTls13
                  ? "POST-QUANTUM AEAD"
                  : "REMEDIATED TLS"
                : isAttackStage
                ? "STRIPTLS INTERCEPTED"
                : "UNENCRYPTED VULNERABLE"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#777a88] hover:text-white hover:bg-[#1a1c24] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-[11px]">
          {/* 4-Tuple Wire Coordinates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded bg-[#12141c] border border-[#1c1d22]">
            <div>
              <div className="text-[9px] text-[#777a88]">SOURCE ENDPOINT</div>
              <div className="text-white font-semibold">{clientIp}:49300</div>
            </div>
            <div>
              <div className="text-[9px] text-[#777a88]">DESTINATION MTA</div>
              <div className="text-white font-semibold">{serverIp}:{port}</div>
            </div>
            <div>
              <div className="text-[9px] text-[#777a88]">INSPECTED WIRE LAYER</div>
              <div className="text-[#38bdf8] font-semibold">
                {isHardened
                  ? enforceTls13
                    ? "TLS 1.3 Record"
                    : "TLS 1.2 Record"
                  : "Plaintext TCP"}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-[#777a88]">DEFENSE SENSOR</div>
              <div className="text-[#34d399] font-semibold">TAP-01 (PASSIVE)</div>
            </div>
          </div>

          {/* Cryptographic Dissection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Handshake Parameters */}
            <div className="p-3 rounded bg-[#0b0c12] border border-[#1c1d22] space-y-2">
              <div className="text-[10px] text-[#38bdf8] font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHIC NEGOTIATION</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Protocol Version:</span>
                  <span className="text-white font-semibold">
                    {enforceTls13 && currentStage >= 3
                      ? "TLSv1.3 (0x0304)"
                      : isHardened
                      ? "TLSv1.2 (0x0303)"
                      : "SSLv3.0 / None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Negotiated Cipher:</span>
                  <span className={isHardened ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {enforceAead && currentStage >= 3
                      ? "TLS_AES_256_GCM_SHA384"
                      : isHardened
                      ? "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA"
                      : "TLS_RSA_WITH_3DES_EDE_CBC_SHA"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Key Exchange (PFS):</span>
                  <span className={isHardened ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {enforcePfs && enforceTls13 && currentStage >= 3
                      ? "ECDHE + ML-KEM-768 (Lattice)"
                      : enforcePfs && currentStage >= 3
                      ? "ECDHE (SecP256r1)"
                      : "Static RSA (Zero PFS)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Post-Quantum Group:</span>
                  <span className={enforceTls13 && currentStage >= 3 ? "text-[#a855f7] font-semibold" : "text-[#777a88]"}>
                    {enforceTls13 && currentStage >= 3 ? "0x11ec (X25519MLKEM768)" : "None (Vulnerable)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Threat Analysis & NIST Impact */}
            <div className="p-3 rounded bg-[#0b0c12] border border-[#1c1d22] space-y-2">
              <div className="text-[10px] text-[#cc9166] font-bold flex items-center gap-1.5">
                {isHardened ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
                )}
                <span>ATTACK TAMPER RESISTANCE</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#777a88]">STRIPTLS Downgrade:</span>
                  <span className={anyPolicyActive && currentStage >= 2 ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {anyPolicyActive && currentStage >= 2 ? "DEFLECTED (Alert 70)" : "SUSCEPTIBLE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Cleartext Credential Leak:</span>
                  <span className={isHardened ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {isHardened ? "PREVENTED" : "AUTH PLAIN DETECTED"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">NIST SP 800-52r2:</span>
                  <span className={isHardened ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {enforceTls13 && enforcePfs && enforceAead && renewCerts && currentStage >= 3
                      ? "FULL COMPLIANCE (Pass)"
                      : isHardened
                      ? "PARTIAL COMPLIANCE"
                      : "NON-COMPLIANT (Fail)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777a88]">Harvest Now, Decrypt Later:</span>
                  <span className={enforceTls13 && currentStage >= 3 ? "text-[#34d399] font-semibold" : "text-[#ef4444] font-semibold"}>
                    {enforceTls13 && currentStage >= 3 ? "IMMUNIZED (FIPS 203)" : "AT RISK"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hexadecimal Frame Dissection Dump */}
          <div className="p-3 rounded bg-[#07070a] border border-[#1c1d22] space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#777a88] flex items-center gap-1">
                <FileCode className="w-3 h-3 text-[#38bdf8]" />
                <span>HEX STREAM DUMP (RECONSTRUCTED WIRE OFFSET)</span>
              </span>
              <span className="text-[9px] text-[#34d399]">OFFSET: 0x0000 - 0x0040</span>
            </div>
            <pre className="p-2.5 rounded bg-[#030305] border border-[#14161f] text-[10px] text-[#9194a1] overflow-x-auto leading-relaxed">
              {enforceTls13 && currentStage >= 3 ? (
                <>
                  <span className="text-[#38bdf8] font-bold">16 03 04 00 c8</span>{" "}
                  <span className="text-[#777a88]">01 00 00 c4 03 03</span>{" "}
                  <span className="text-[#34d399] font-bold">13 01 13 02 13 03</span>{" "}
                  <span className="text-[#a855f7] font-bold">00 2b 00 02 03 04</span>
                  {"\n"}
                  <span className="text-[#a855f7] font-bold">00 33 04 60 11 ec</span>{" "}
                  <span className="text-[#777a88]">74 6c 73 2e 67 6f 76 2e</span>{" "}
                  <span className="text-[#38bdf8]">69 6e 00 00 00 17 00 00</span>{" "}
                  <span className="text-[#34d399]">23 00 00 00 0d 00 14</span>
                  {"\n"}
                  <span className="text-[#777a88]">
                    ASCII: ...TLSv1.3...AES_256_GCM...X25519MLKEM768...mail.gov.in
                  </span>
                </>
              ) : isHardened ? (
                <>
                  <span className="text-[#38bdf8] font-bold">16 03 03 00 9a</span>{" "}
                  <span className="text-[#777a88]">01 00 00 96 03 03</span>{" "}
                  <span className="text-[#34d399] font-bold">c0 2f c0 30 c0 14</span>{" "}
                  <span className="text-[#777a88]">00 00 23 00 00 00 0f</span>
                  {"\n"}
                  <span className="text-[#38bdf8]">
                    ASCII: ...TLSv1.2...ECDHE_RSA_AES_GCM_SHA256...
                  </span>
                </>
              ) : isAttackStage ? (
                <>
                  <span className="text-[#ef4444] font-bold">53 54 52 49 50 54 4c 53</span>{" "}
                  <span className="text-[#777a88]">20 41 54 54 41 43 4b 20</span>{" "}
                  <span className="text-[#ef4444] font-bold">32 35 30 2d 50 49 50 45</span>{" "}
                  <span className="text-[#777a88]">4c 49 4e 49 4e 47 0d 0a</span>
                  {"\n"}
                  <span className="text-[#ef4444] font-bold">53 45 4e 53 4f 52 3a 20</span>{" "}
                  <span className="text-[#34d399] font-bold">53 53 4c 20 41 4c 45 52</span>{" "}
                  <span className="text-[#34d399] font-bold">54 20 37 30 20 44 52 4f</span>{" "}
                  <span className="text-[#34d399] font-bold">50 20 46 52 41 4d 45</span>
                  {"\n"}
                  <span className="text-[#ef4444]">
                    ASCII: STRIPTLS ATTACK (250-STARTTLS removed) -&gt; SENSOR DEFLECTED
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[#ef4444] font-bold">41 55 54 48 20 50 4c 41</span>{" "}
                  <span className="text-[#ef4444] font-bold">49 4e 20 64 47 56 7a 64</span>{" "}
                  <span className="text-[#777a88]">47 39 79 4f 6d 78 6c 5a</span>{" "}
                  <span className="text-[#777a88]">33 46 6a 65 57 39 79 61</span>
                  {"\n"}
                  <span className="text-[#777a88]">32 56 79 4d 54 49 7a 4e</span>{" "}
                  <span className="text-[#777a88]">44 55 32 0d 0a 00 00 00</span>{" "}
                  <span className="text-[#777a88]">32 35 30 20 32 2e 31 2e</span>{" "}
                  <span className="text-[#777a88]">30 20 4f 6b 0d 0a 00 00</span>
                  {"\n"}
                  <span className="text-[#ef4444]">
                    ASCII: AUTH PLAIN dGVzdG9yOmxlZ3FjeW9ya2VyMTIzNDU2... (CLEARTEXT PASSWORD LEAK)
                  </span>
                </>
              )}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1c1d22] bg-[#0b0c12] flex items-center justify-between text-[10px]">
          <span className="text-[#777a88] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
            <span>NIST SP 800-52r2 §3.1 & IETF RFC 8446 Wire Inspection Engine</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1e202a] text-white hover:bg-[#2e3038] transition-colors"
          >
            Close Dissector
          </button>
        </div>
      </div>
    </div>
  );
}
