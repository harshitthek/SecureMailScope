"use client";

import { Session } from "@/lib/types";
import { CertChainCard } from "./cert-chain-card";
import { Ja3Card } from "./ja3-card";
import { DeductionLedger } from "./deduction-ledger";

interface DissectorModeAProps {
  session: Session;
}

export function DissectorModeA({ session }: DissectorModeAProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
      <CertChainCard certificate={session.certificate} />
      <Ja3Card
        ja3Hash={session.ja3_hash}
        ja3ClientName={session.ja3_client_name}
        ja3IsKnown={session.ja3_is_known}
      />
      <DeductionLedger
        scoring={session.scoring_breakdown}
        sessionScore={session.session_score}
      />
    </div>
  );
}
