"use client";

import { Session } from "@/lib/types";

interface SessionDetailTlsTabProps {
  session: Session;
}

export function SessionDetailTlsTab({ session }: SessionDetailTlsTabProps) {
  return (
    <div className="border border-tactical-border bg-tactical-bg p-4 space-y-4 font-mono">
      <div className="border-b border-tactical-border pb-2 text-xs font-bold text-tactical-text uppercase">
        CRYPTOGRAPHIC PARAMETERS &amp; HANDSHAKE DISSECTION
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1.5">
            <span className="text-[10px] uppercase text-tactical-dim font-bold block">Protocol Version</span>
            <div className="text-sm font-bold text-tactical-text">{session.tls_version || "None (Plaintext)"}</div>
            <div className="text-xs text-tactical-dim">
              {session.tls_version === "TLS 1.3"
                ? "RFC 8446 Hardened modern standard"
                : session.tls_version === "TLS 1.2"
                ? "NIST SP 800-52r2 baseline compliant"
                : "RFC 8996 Prohibited / Insecure"}
            </div>
          </div>

          <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1.5">
            <span className="text-[10px] uppercase text-tactical-dim font-bold block">Negotiated Cipher Suite</span>
            <div className="text-sm font-bold text-phosphor-cyan break-all">
              {session.cipher_suite_name || "None (Cleartext Fallback)"}
            </div>
            <div className="text-xs text-tactical-dim">
              IANA Hex ID: <span className="text-tactical-text font-bold">{session.cipher_suite_hex || "0x0000"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1.5">
            <span className="text-[10px] uppercase text-tactical-dim font-bold block">Key Exchange &amp; PFS</span>
            <div className="text-sm font-bold text-tactical-text">{session.key_exchange || "None"}</div>
            <div className={session.has_forward_secrecy ? "text-phosphor-green font-bold text-xs" : "text-phosphor-hazard font-bold text-xs"}>
              {session.has_forward_secrecy ? "✓ Ephemeral Key Exchange (PFS Enforced)" : "✗ Static Key Exchange (No Forward Secrecy)"}
            </div>
          </div>

          <div className="p-3 border border-tactical-border bg-tactical-surface space-y-1.5">
            <span className="text-[10px] uppercase text-tactical-dim font-bold block">JA3 Client Fingerprint</span>
            <div className="text-xs font-mono text-tactical-text truncate" title={session.ja3_hash || ""}>
              {session.ja3_hash || "No ClientHello JA3 Available"}
            </div>
            <div className="text-xs text-tactical-dim">
              Signature Profile:{" "}
              <span className={session.ja3_is_known ? "text-phosphor-green font-bold" : "text-phosphor-amber font-bold"}>
                {session.ja3_client_name || "Unknown / Unregistered Client"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
