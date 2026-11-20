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
      <span className="workspace-badge inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full border border-info bg-info/40 motion-safe:animate-pulse"
        />
        <span>Checking</span>
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="workspace-badge inline-flex items-center gap-1.5 text-xs font-medium text-foreground/90">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-positive"
        />
        <span>Ready</span>
        {!compact && typeof latencyMs === "number" && (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {Math.round(latencyMs)}ms
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="workspace-badge inline-flex items-center gap-1.5 text-xs font-medium text-caution">
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rotate-45 bg-caution"
      />
      <span>Unavailable</span>
    </span>
  );
}
