import { CertificateInfo } from "@/lib/types";
import { Calendar, ShieldAlert, CheckCircle2 } from "lucide-react";

interface SessionCertCardProps {
  certificate: CertificateInfo;
}

export function SessionCertCard({ certificate }: SessionCertCardProps) {
  return (
    <div className="p-3.5 rounded-lg border border-soc-border bg-soc-bg/90 text-xs font-mono space-y-3">
      <div className="flex items-center justify-between border-b border-soc-border/60 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>X.509 Certificate Profile ({certificate.subject_cn})</span>
        </div>
        <div className="flex items-center gap-1.5">
          {certificate.is_self_signed && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Self-Signed CA
            </span>
          )}
          {certificate.is_expired ? (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Expired Cert
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Valid Trust Chain
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-400">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Issuer Authority</span>
          <span className="text-slate-200 font-medium truncate block mt-0.5" title={certificate.issuer_cn}>
            {certificate.issuer_cn}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Public Key Bits</span>
          <span
            className={`block mt-0.5 font-bold ${
              certificate.is_weak_key ? "text-rose-400" : "text-slate-200"
            }`}
          >
            {certificate.public_key_type} {certificate.public_key_bits}-bit
            {certificate.is_weak_key && " (WEAK)"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Digest Algorithm</span>
          <span
            className={`block mt-0.5 font-bold ${
              certificate.is_weak_signature ? "text-rose-400" : "text-slate-200"
            }`}
          >
            {certificate.signature_hash}
            {certificate.is_weak_signature && " (DEPRECATED)"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Validity Period</span>
          <span
            className={`block mt-0.5 font-bold tabular-nums ${
              certificate.is_expired ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {certificate.is_expired
              ? `Expired ${Math.abs(certificate.days_remaining)} days ago`
              : `${certificate.days_remaining} days remaining`}
          </span>
        </div>
      </div>

      {certificate.san_entries.length > 0 && (
        <div className="pt-2 border-t border-soc-border/60 text-[11px]">
          <span className="text-slate-500 mr-2">SAN Hostnames:</span>
          <span className="text-slate-300 font-mono">{certificate.san_entries.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
