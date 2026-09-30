import { Session } from "@/lib/types";
import { SessionCryptoCards } from "./session-crypto-cards";
import { SessionCertCard } from "./session-cert-card";

interface SessionDetailProps {
  session: Session;
}

export function SessionDetail({ session }: SessionDetailProps) {
  const { certificate } = session;

  return (
    <div className="p-4 bg-soc-card/90 rounded-lg border border-soc-borderHighlight/70 space-y-3 shadow-tactical-sm">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-soc-border pb-2">
        <span className="text-cyan-400 font-bold uppercase tracking-wider">
          Stream #{session.session_id} Forensic Telemetry Dossier
        </span>
        <span>
          Recorded: {new Date(session.timestamp).toUTCString()}
        </span>
      </div>

      <SessionCryptoCards session={session} />

      {certificate && <SessionCertCard certificate={certificate} />}
    </div>
  );
}
