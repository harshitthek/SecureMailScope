import { ComplianceCheck } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, Shield } from "lucide-react";

interface ComplianceChecklistProps {
  compliance: ComplianceCheck[];
}

export function ComplianceChecklist({ compliance }: ComplianceChecklistProps) {
  const getStatusIcon = (status: "pass" | "fail" | "warn") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case "warn":
        return <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
      case "fail":
      default:
        return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    }
  };

  const passCount = compliance.filter((c) => c.status === "pass").length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900 shadow-sm p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Regulatory Standards Compliance
          </h3>
          <p className="text-xs text-slate-500">
            NIST SP 800-52r2 & RFC baseline compliance auditing
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {passCount} / {compliance.length} Passed
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1">
        {compliance.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-800/80 bg-slate-950/60"
          >
            {getStatusIcon(item.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-slate-300">
                  {item.standard} {item.section}
                </span>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                    item.status === "pass"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : item.status === "warn"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                {item.requirement}
              </p>
              {item.details && (
                <p className="mt-1 text-[10px] text-slate-500 font-mono truncate">
                  {item.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
