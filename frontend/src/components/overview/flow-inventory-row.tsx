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
      ? "3DES-EDE"
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

  const flowCode = `F0${index + 1}`;

  return (
    <div
      onClick={() => onSelect(session.session_id)}
      className="w-full grid grid-cols-12 gap-3 py-3.5 px-4 items-center hover:bg-tactical-surfaceHover relative group cursor-pointer transition-colors border-l-2 border-transparent hover:border-phosphor-cyan"
    >
      <div className="col-span-1 font-bold text-white flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCrit
              ? "bg-phosphor-hazard"
              : isDegraded
              ? "bg-phosphor-amber"
              : "bg-phosphor-green"
          }`}
        />
        <span>{flowCode}</span>
      </div>

      <div className="col-span-3 truncate text-tactical-text">
        <span className="font-semibold text-white">
          {session.server_name || session.dst_ip}
        </span>
        <span className="text-tactical-dim ml-1.5">:{session.dst_port}</span>
      </div>

      <div className="col-span-1 text-tactical-dim font-semibold">
        {session.protocol}
      </div>

      <div className="col-span-2">
        <span
          className={
            !session.is_encrypted
              ? "text-phosphor-hazard font-bold"
              : session.tls_version === "TLS 1.3"
              ? "text-phosphor-green font-bold"
              : "text-phosphor-amber"
          }
        >
          {protoDisplay}
        </span>
      </div>

      <div className="col-span-2 truncate text-tactical-text">
        <span
          className={
            cipherDisplay.includes("3DES") || cipherDisplay === "NONE"
              ? "text-phosphor-hazard font-semibold"
              : ""
          }
        >
          {cipherDisplay}
        </span>
      </div>

      <div className="col-span-1">
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

      <div className="col-span-1 text-right">
        <span className={`font-bold tabular-nums ${scoreColor}`}>
          {session.session_score} {session.session_grade}
        </span>
      </div>

      <div className="col-span-1 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(session.session_id);
          }}
          className="text-tactical-dim group-hover:text-phosphor-cyan text-[11px] font-bold uppercase inline-flex items-center gap-1 transition-colors"
        >
          <span>INSPECT</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
