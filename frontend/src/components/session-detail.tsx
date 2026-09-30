import { Session } from "@/lib/types";
import { Lock, Unlock, ShieldCheck, AlertCircle, Key, Calendar } from "lucide-react";

interface SessionDetailProps {
  session: Session;
}

export function SessionDetail({ session }: SessionDetailProps) {
  const { certificate, scoring_breakdown } = session;

  return (
    <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Column 1: Cryptographic Handshake Details */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>Handshake & Cipher Parameters</span>
          </div>
          <div className="space-y-1 text-slate-400">
            <div>
              <span className="text-slate-500">Negotiated Suite:</span>{" "}
              <span className="font-mono text-slate-200">
                {session.cipher_suite_name || "None (Cleartext Transmission)"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Hex Code:</span>{" "}
              <span className="font-mono text-slate-300">
                {session.cipher_suite_hex || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Key Exchange:</span>{" "}
              <span className="font-mono text-slate-300">
                {session.key_exchange || "None"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {session.has_forward_secrecy ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Lock className="w-3 h-3" /> Perfect Forward Secrecy (PFS)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  <Unlock className="w-3 h-3" /> No Forward Secrecy (Static Key)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Client JA3 Fingerprint */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Client Fingerprint (JA3)</span>
          </div>
          <div className="space-y-1 text-slate-400">
            <div>
              <span className="text-slate-500">Recognized Client:</span>{" "}
              <span className="font-semibold text-slate-200">
                {session.ja3_client_name || "Unknown / Unclassified Client"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Fingerprint Hash:</span>
              <div className="mt-1 font-mono text-[11px] p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-300 select-all truncate">
                {session.ja3_hash || "No TLS Client Hello Recorded"}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Registry Match:</span>{" "}
              <span
                className={`font-semibold ${
                  session.ja3_is_known ? "text-emerald-400" : "text-yellow-400"
                }`}
              >
                {session.ja3_is_known ? "Known Legitimate Client" : "Unmapped Signature"}
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Penalty Scoring Breakdown */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span>Score Deductions</span>
          </div>
          <div className="space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-500">Protocol Version:</span>
              <span className="font-mono text-red-400">{scoring_breakdown.protocol_penalty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cipher Weakness:</span>
              <span className="font-mono text-red-400">{scoring_breakdown.cipher_penalty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Forward Secrecy:</span>
              <span className="font-mono text-red-400">{scoring_breakdown.pfs_penalty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certificate Trust:</span>
              <span className="font-mono text-red-400">{scoring_breakdown.cert_penalty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">JA3 / ML Anomaly:</span>
              <span className="font-mono text-red-400">{scoring_breakdown.anomaly_penalty}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold text-slate-200">
              <span>Final Session Score:</span>
              <span className="text-slate-100">{scoring_breakdown.final_score} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details If Present */}
      {certificate && (
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>X.509 Certificate Profile ({certificate.subject_cn})</span>
            </div>
            <div className="flex items-center gap-2">
              {certificate.is_self_signed && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Self-Signed
                </span>
              )}
              {certificate.is_expired && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Expired
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-400">
            <div>
              <span className="text-slate-500 block">Issuer:</span>
              <span className="text-slate-200 font-medium truncate block">
                {certificate.issuer_cn}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Public Key:</span>
              <span
                className={`font-mono ${
                  certificate.is_weak_key ? "text-red-400 font-bold" : "text-slate-200"
                }`}
              >
                {certificate.public_key_type} {certificate.public_key_bits}-bit
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Signature Digest:</span>
              <span
                className={`font-mono ${
                  certificate.is_weak_signature ? "text-red-400 font-bold" : "text-slate-200"
                }`}
              >
                {certificate.signature_hash}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Validity Remaining:</span>
              <span
                className={`font-semibold ${
                  certificate.is_expired ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {certificate.days_remaining} days
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
