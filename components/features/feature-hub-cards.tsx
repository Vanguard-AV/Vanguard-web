"use client";

import {
  AlertTriangle,
  ArrowRight,
  Binary,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Globe,
  Mail,
  MessageSquareWarning,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FEATURE_CATALOG } from "@/lib/features/catalog";
import type {
  FeatureSlug,
  ServiceReadinessSnapshot,
} from "@/lib/features/types";
import { ReadinessBadge } from "./readiness-badge";

const FEATURE_ICONS: Record<FeatureSlug, typeof Mail> = {
  url: Globe,
  email: Mail,
  sms: MessageSquareWarning,
  office: FileSpreadsheet,
  pdf: FileText,
  exe: Binary,
};

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

  return (
    <div className="space-y-4">
      <div
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          {snapshot.overallStatus === "healthy" ? (
            <CheckCircle2
              aria-hidden="true"
              className="size-4 shrink-0 text-positive"
              strokeWidth={1.75}
            />
          ) : (
            <AlertTriangle
              aria-hidden="true"
              className="size-4 shrink-0 text-caution"
              strokeWidth={1.75}
            />
          )}
          <span className="font-semibold text-foreground tabular-nums">
            {snapshot.readyCount} of {snapshot.totalCount} scanners ready
          </span>
          {snapshot.overallStatus !== "healthy" && (
            <span className="text-muted-foreground">
              {snapshot.overallStatus === "degraded"
                ? "— Healthy scanners remain active while offline services recover."
                : snapshot.overallStatus === "unconfigured"
                  ? "— Scanning backend is not configured in this environment."
                  : "— Scanning services are currently unreachable."}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={refreshHealth}
          disabled={refreshing}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-outline bg-surface px-3 text-xs font-semibold text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-3.5 ${refreshing ? "motion-safe:animate-spin" : ""}`}
            strokeWidth={1.75}
          />
          <span>{refreshing ? "Checking..." : "Refresh status"}</span>
        </button>
      </div>

      <div className="workspace-panel overflow-hidden rounded-xl border border-outline bg-surface">
        <ul className="divide-y divide-outline">
          {FEATURE_CATALOG.map((feature) => {
            const Icon = FEATURE_ICONS[feature.slug];
            const readiness = snapshot.features[feature.slug];

            return (
              <li key={feature.slug}>
                <Link
                  href={feature.route}
                  className="group grid grid-cols-1 gap-3 px-4 py-4 motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover sm:px-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-accent"
                      strokeWidth={1.75}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="block text-base font-semibold text-foreground group-hover:text-accent">
                        {feature.name}
                      </span>
                      <span className="block max-w-[62ch] text-sm leading-5 text-muted-foreground">
                        {feature.summary}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ps-8 text-xs text-muted-foreground lg:flex-col lg:items-start lg:ps-0">
                    <span className="font-mono text-foreground/90 break-words">
                      {feature.formatLabel}
                    </span>
                    <span className="tabular-nums">{feature.limitLabel}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 ps-8 lg:justify-end lg:ps-0">
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
                    <span className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent">
                      <span>Open</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 motion-safe:transition-transform motion-safe:duration-150 group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function FeatureHubSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading scanner readiness"
    >
      <div className="flex min-h-11 items-center justify-between text-sm text-muted-foreground">
        <span>Checking live scanner readiness...</span>
        <ReadinessBadge status="checking" />
      </div>

      <div className="overflow-hidden rounded-xl border border-outline bg-surface">
        <ul className="divide-y divide-outline">
          {FEATURE_CATALOG.map((feature) => (
            <li
              key={feature.slug}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {feature.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {feature.summary}
                </p>
              </div>
              <ReadinessBadge status="checking" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
