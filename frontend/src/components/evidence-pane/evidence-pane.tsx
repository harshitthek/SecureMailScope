"use client";

import { EvidenceCase } from "@/lib/types";
import { QuickFilter } from "@/hooks/use-workstation";
import { CaseSelector } from "./case-selector";
import { CompactDropStrip } from "./compact-drop-strip";
import { QuickFilters } from "./quick-filters";
import { StandardsSummary } from "./standards-summary";

interface EvidencePaneProps {
  cases: EvidenceCase[];
  activeCaseId: string;
  activeCase: EvidenceCase;
  quickFilter: QuickFilter;
  isAnalyzing: boolean;
  uploadError?: string | null;
  onClearError?: () => void;
  onSelectCase: (id: string) => void;
  onFilterChange: (f: QuickFilter) => void;
  onFileUpload: (file: File) => void;
}

export function EvidencePane({
  cases,
  activeCaseId,
  activeCase,
  quickFilter,
  isAnalyzing,
  uploadError,
  onClearError,
  onSelectCase,
  onFilterChange,
  onFileUpload,
}: EvidencePaneProps) {
  return (
    <aside className="w-full h-full border-r border-tactical-border bg-tactical-bg p-3 flex flex-col gap-3 font-mono">
      {/* 1. High-Tech Ingestion Strip */}
      <CompactDropStrip
        onFileSelect={onFileUpload}
        isAnalyzing={isAnalyzing}
        error={uploadError}
        onClearError={onClearError}
      />

      {/* 2. Quick Filters */}
      <QuickFilters
        filter={quickFilter}
        onFilterChange={onFilterChange}
      />

      {/* 3. Evidence Queue Case List */}
      <div className="flex-1 min-h-0">
        <CaseSelector
          cases={cases}
          activeCaseId={activeCaseId}
          quickFilter={quickFilter}
          onSelectCase={onSelectCase}
        />
      </div>

      {/* 4. Standards Summary */}
      <StandardsSummary compliance={activeCase.data.compliance} />
    </aside>
  );
}
