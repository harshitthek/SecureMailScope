import { AlertTriangle } from "lucide-react";
import { Vulnerability } from "@/lib/types";

interface AlertBannerProps {
  vulnerabilities: Vulnerability[];
}

export function AlertBanner({ vulnerabilities }: AlertBannerProps) {
  const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical");

  if (criticalVulns.length === 0) {
    return null;
  }

  const primaryAlert = criticalVulns[0];

  return (
    <div className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-sm">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-400">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30">
            Critical Severity Alert
          </span>
          <h4 className="text-sm font-semibold truncate text-red-200">
            {primaryAlert.title}
          </h4>
        </div>
        <p className="mt-0.5 text-xs text-red-300/90 line-clamp-1">
          {primaryAlert.description}
        </p>
      </div>
    </div>
  );
}
