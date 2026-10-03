"use client";

import { Session } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface FlowInventoryRowProps {
  session: Session;
  index: number;
  onSelect: (id: number) => void;
}

export function FlowInventoryRow({ session, index, onSelect }: FlowInventoryRowProps) {
  const isCrit = session.session_score < 50 || session.session_severity === "critical";
  const isDegraded = session.session_score >= 50 && session.session_score < 80;

  const scoreColor = isCrit
    ? "text-phosphor-hazard"
    : isDegraded
    ? "text-phosphor-amber"
    : "text-phosphor-green";

  const protoDisplay = session.tls_version || "CLEAR";
  const cipherDisplay = session.cipher_suite_name
    ? session.cipher_suite_name.includes("3DES")
      ? "3DES"
      : session.cipher_suite_name.includes("AES_256_GCM")
      ? "AES-256-GCM"
      : session.cipher_suite_name.includes("AES_128_GCM")
      ? "AES-128-GCM"
      : session.cipher_suite_name.replace("TLS_", "").slice(0, 14)
    : "NONE";

  const kexDisplay = session.key_exchange
    ? session.key_exchange.includes("ECDHE")
      ? "ECDHE"
      : session.key_exchange.includes("DHE")
      ? "DHE"
      : "RSA"
    : "NONE";

  const flowIdStr = index < 9 ? `0${index + 1}` : `${index + 1}`;
  const endpointDisplay = session.server_name
    ? `${session.server_name}:${session.dst_port}`
    : `${session.dst_ip}:${session.dst_port}`;

  return (
    <div
      onClick={() => onSelect(session.session_id)}
      className="w-full py-3.5 px-4 min-h-[66px] flex flex-col justify-center hover:bg-tactical-surfaceHover relative group cursor-pointer transition-colors border-l-2 border-transparent hover:border-phosphor-cyan space-y-1 select-none"
    >
      {/* Line 1: Flow Index, Endpoint, Dotted Leader, and Score */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full ${
              isCrit
                ? "bg-phosphor-hazard"
                : isDegraded
                ? "bg-phosphor-amber"
                : "bg-phosphor-green"
            }`}
          />
          <span className="text-tactical-dim font-bold text-[14px]">{flowIdStr}</span>
          <span className="text-tactical-text font-bold text-[15px] sm:text-[16px] tracking-tight">
            {endpointDisplay}
          </span>
        </div>

        <div className="flex-1 mx-4 border-b border-dotted border-tactical-border/40 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className={`text-[16px] font-bold tabular-nums ${scoreColor}`}>
            {session.session_score} {session.session_grade}
          </span>
        </div>
      </div>

      {/* Line 2: Telemetry tokens & Inspect action */}
      <div className="flex items-center justify-between font-mono text-[13px] sm:text-[14px] text-tactical-dim pl-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-tactical-text font-semibold">{session.protocol}</span>
          <span>·</span>
          <span
            className={
              !session.is_encrypted
                ? "text-phosphor-hazard font-bold"
                : session.tls_version === "TLS 1.3"
                ? "text-phosphor-green font-semibold"
                : "text-phosphor-amber"
            }
          >
            {protoDisplay}
          </span>
          <span>·</span>
          <span
            className={
              cipherDisplay === "3DES" || cipherDisplay === "NONE"
                ? "text-phosphor-hazard font-semibold"
                : "text-tactical-text"
            }
          >
            {cipherDisplay}
          </span>
          <span>·</span>
          <span
            className={
              session.has_forward_secrecy
                ? "text-phosphor-green font-semibold"
                : "text-phosphor-hazard font-semibold"
            }
          >
            {kexDisplay}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[13px] text-phosphor-cyan font-bold uppercase">
          <span>INSPECT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
