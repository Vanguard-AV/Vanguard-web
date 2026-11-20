"use client";

import { ArrowUpRight, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  Feature,
  type FeatureAdvantageItem,
} from "@/components/ui/feature-with-advantages";
import { FEATURE_CATALOG } from "@/lib/features/catalog";
import type { ServiceReadinessSnapshot } from "@/lib/features/types";
import { ReadinessBadge } from "./readiness-badge";

interface FeatureHubDirectoryProps {
  initialSnapshot: ServiceReadinessSnapshot;
}

export function FeatureHubDirectory({
  initialSnapshot,
}: FeatureHubDirectoryProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshHealth() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch("/api/features/health", {
        cache: "no-store",
      });
      if (response.ok) {
        const next = (await response.json()) as ServiceReadinessSnapshot;
        setSnapshot(next);
      }
    } catch {
      // Preserve last known status on transient network failure.
    } finally {
      setRefreshing(false);
    }
  }

  const items: FeatureAdvantageItem[] = FEATURE_CATALOG.map((feature) => {
    const readiness = snapshot.features[feature.slug];

    return {
      id: feature.slug,
      href: feature.route,
      icon: (
        <Check
          aria-hidden="true"
          className="mt-1.5 size-4 shrink-0 text-accent"
          strokeWidth={2}
        />
      ),
      title: (
        <span className="inline-flex items-center gap-1">
          <span>{feature.name}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
            strokeWidth={1.75}
          />
        </span>
      ),
      description: feature.summary,
      footer: (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <ReadinessBadge
            status={
              refreshing
                ? "checking"
                : readiness.ready
                  ? "ready"
                  : "unavailable"
            }
            latencyMs={readiness.latencyMs}
          />
          <span aria-hidden="true" className="text-outline">
            ·
          </span>
          <span className="tabular-nums">{feature.limitLabel}</span>
        </div>
      ),
    };
  });

  const statusHeader = (
    <div
      aria-live="polite"
      className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-outline pb-3 text-xs"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className={
            snapshot.overallStatus === "healthy"
              ? "size-1.5 shrink-0 rounded-full bg-positive"
              : "size-1.5 shrink-0 rotate-45 bg-caution"
          }
        />
        <span className="font-medium text-foreground/90 tabular-nums">
          {snapshot.readyCount} of {snapshot.totalCount} scanners ready
        </span>
        {snapshot.overallStatus !== "healthy" && (
          <span className="text-muted-foreground">
            {snapshot.overallStatus === "degraded"
              ? "— Offline services recovering"
              : snapshot.overallStatus === "unconfigured"
                ? "— Backend not configured"
                : "— Services unreachable"}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={refreshHealth}
        disabled={refreshing}
        className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-60"
      >
        <RefreshCw
          aria-hidden="true"
          className={`size-3 ${refreshing ? "motion-safe:animate-spin" : ""}`}
          strokeWidth={1.75}
        />
        <span>{refreshing ? "Checking" : "Refresh"}</span>
      </button>
    </div>
  );

  return (
    <Feature
      badge={null}
      title={null}
      description={null}
      headerExtra={statusHeader}
      items={items}
      className="py-0 lg:py-0"
      containerClassName="max-w-none"
      gridClassName="gap-x-10 gap-y-8"
    />
  );
}

export function FeatureHubSkeleton() {
  const skeletonItems: FeatureAdvantageItem[] = FEATURE_CATALOG.map(
    (feature) => ({
      id: feature.slug,
      href: feature.route,
      icon: (
        <Check
          aria-hidden="true"
          className="mt-1.5 size-4 shrink-0 text-accent"
          strokeWidth={2}
        />
      ),
      title: feature.name,
      description: feature.summary,
      footer: (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <ReadinessBadge status="checking" />
          <span aria-hidden="true" className="text-outline">
            ·
          </span>
          <span className="tabular-nums">{feature.limitLabel}</span>
        </div>
      ),
    }),
  );

  return (
    <div aria-busy="true" aria-label="Loading scanner readiness">
      <Feature
        badge={null}
        title={null}
        description={null}
        headerExtra={
          <div className="flex w-full items-center justify-between border-b border-outline pb-3 text-xs text-muted-foreground">
            <ReadinessBadge status="checking" />
          </div>
        }
        items={skeletonItems}
        className="py-0 lg:py-0"
        containerClassName="max-w-none"
        gridClassName="gap-x-10 gap-y-8"
      />
    </div>
  );
}
