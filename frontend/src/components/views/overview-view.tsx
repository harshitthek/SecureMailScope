"use client";

import { AnalysisResult, NavView } from "@/lib/types";
import { CaseContextStrip } from "@/components/overview/case-context-strip";
import { PostureHeroEditorial } from "@/components/overview/posture-hero-editorial";
import { PrimaryFindingHero } from "@/components/overview/primary-finding-hero";
import { FlowInventoryList } from "@/components/overview/flow-inventory-list";
import { SecondaryAnalyticsBlock } from "@/components/overview/secondary-analytics-block";

interface OverviewViewProps {
  data: AnalysisResult;
  caseCode: string;
  onNavigate?: (view: NavView) => void;
  onOpenSessionDetail: (sessionId: number) => void;
  onNavigateToDissector?: (streamId: number) => void;
}

export function OverviewView({
  data,
  caseCode,
  onOpenSessionDetail,
}: OverviewViewProps) {
  const {
    enterprise_score,
    enterprise_grade,
    total_packets,
    filename,
    sessions,
    vulnerabilities,
  } = data;

  return (
    <div className="px-6 py-2.5 lg:px-8 lg:py-3 max-w-[1440px] mx-auto w-full select-none space-y-1">
      {/* 1. QUIET TOP CASE METADATA */}
      <CaseContextStrip
        caseCode={caseCode}
        filename={filename}
        totalPackets={total_packets}
        totalFlows={sessions.length}
      />

      {/* 2. POSTURE HERO INSTRUMENT & ASYMMETRIC SCALE */}
      <PostureHeroEditorial
        score={enterprise_score}
        grade={enterprise_grade}
        sessions={sessions}
        vulnerabilities={vulnerabilities}
      />

      {/* 3. PRIMARY FORENSIC FINDING (ON-WIRE BREACH DIVERGENCE) */}
      <PrimaryFindingHero
        vulnerabilities={vulnerabilities}
        sessions={sessions}
        onInspectFlow={onOpenSessionDetail}
      />

      {/* 4. RECONSTRUCTED EMAIL FLOW INVENTORY LIST */}
      <FlowInventoryList
        sessions={sessions}
        onSelectFlow={onOpenSessionDetail}
      />

      {/* 5. SECONDARY ANALYTICS (TLS / CIPHER / CERTIFICATE PROFILES) */}
      <SecondaryAnalyticsBlock sessions={sessions} />
    </div>
  );
}
