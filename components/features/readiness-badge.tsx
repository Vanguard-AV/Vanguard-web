import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface ReadinessBadgeProps {
  status: "ready" | "unavailable" | "checking";
  latencyMs?: number | null;
  compact?: boolean;
}

export function ReadinessBadge({
  status,
  latencyMs,
  compact = false,
}: ReadinessBadgeProps) {
  if (status === "checking") {
    return (
      <span className="workspace-badge inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info-bg px-2.5 py-1 text-xs font-medium text-info">
        <Clock aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span>Checking status</span>
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="workspace-badge inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive-bg px-2.5 py-1 text-xs font-medium text-positive">
        <CheckCircle2
          aria-hidden="true"
          className="size-3.5 shrink-0"
          strokeWidth={1.75}
        />
        <span>Ready</span>
        {!compact && typeof latencyMs === "number" && (
          <span className="font-mono text-xs text-positive/85 tabular-nums">
            {Math.round(latencyMs)} ms
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="workspace-badge inline-flex items-center gap-1.5 rounded-full border border-caution/30 bg-caution-bg px-2.5 py-1 text-xs font-medium text-caution">
      <XCircle
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={1.75}
      />
      <span>Unavailable</span>
    </span>
  );
}
