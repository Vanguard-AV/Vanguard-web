"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import type {
  FeatureSlug,
  ServiceReadinessSnapshot,
} from "@/lib/features/types";
import { ReadinessBadge } from "./readiness-badge";

interface FeatureReadinessClientProps {
  slug: FeatureSlug;
  initialSnapshot: ServiceReadinessSnapshot;
}

export function FeatureReadinessClient({
  slug,
  initialSnapshot,
}: FeatureReadinessClientProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [checking, setChecking] = useState(false);
  const current = snapshot.features[slug];

  async function recheck() {
    if (checking) return;
    setChecking(true);
    try {
      const response = await fetch("/api/features/health", {
        cache: "no-store",
      });
      if (response.ok) {
        const next = (await response.json()) as ServiceReadinessSnapshot;
        setSnapshot(next);
      }
    } catch {
      // Keep prior status visible if network re-check fails.
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-2"
    >
      <ReadinessBadge
        status={checking ? "checking" : current.ready ? "ready" : "unavailable"}
        latencyMs={current.latencyMs}
      />
      <button
        type="button"
        onClick={recheck}
        disabled={checking}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface px-3 text-xs font-semibold text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-60"
      >
        <RefreshCw
          aria-hidden="true"
          className={`size-3.5 ${checking ? "motion-safe:animate-spin" : ""}`}
          strokeWidth={1.75}
        />
        <span>{checking ? "Checking..." : "Check status"}</span>
      </button>
    </div>
  );
}
