"use client";

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { formatBytes, formatPercent } from "@/lib/features/catalog";
import {
  downloadScanSummaryReport,
  serializeScanSummaryReport,
} from "@/lib/features/report-download";
import type {
  AdvisoryVerdict,
  CoverageStatus,
  ScanOutcome,
} from "@/lib/features/types";
import { CopyButton } from "./copy-button";
import { ScanTechnicalDetails } from "./scan-technical-details";

interface ScanResultPanelProps {
  outcome: ScanOutcome;
  onReset: () => void;
}

const VERDICT_STYLES: Record<
  AdvisoryVerdict,
  {
    badge: string;
    panelTint: string;
    Icon: typeof CheckCircle2;
  }
> = {
  benign: {
    badge: "border-positive/35 bg-positive-bg text-positive",
    panelTint: "border-positive/30 bg-positive-bg/35",
    Icon: CheckCircle2,
  },
  review: {
    badge: "border-caution/35 bg-caution-bg text-caution",
    panelTint: "border-caution/30 bg-caution-bg/35",
    Icon: AlertTriangle,
  },
  malicious: {
    badge: "border-danger/35 bg-danger-bg text-danger",
    panelTint: "border-danger/30 bg-danger-bg/35",
    Icon: ShieldAlert,
  },
};

function coverageToneClass(coverage: CoverageStatus): string {
  if (coverage === "complete") {
    return "border-outline bg-surface-raised text-foreground";
  }
  if (coverage === "limited") {
    return "border-info/35 bg-info-bg text-info";
  }
  return "border-caution/35 bg-caution-bg text-caution";
}

export function ScanResultPanel({ outcome, onReset }: ScanResultPanelProps) {
  const verdictStyle = VERDICT_STYLES[outcome.verdict];
  const VerdictIcon = verdictStyle.Icon;

  return (
    <section
      aria-labelledby="scan-outcome-heading"
      className="workspace-panel overflow-hidden rounded-xl border border-outline bg-surface"
    >
      {/* Top verdict banner — flat tinted header, Action vs. Verdict rule preserved */}
      <div className={`border-b px-5 py-5 sm:px-6 ${verdictStyle.panelTint}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`workspace-badge inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verdictStyle.badge}`}
              >
                <VerdictIcon
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                <span>{outcome.verdictLabel}</span>
              </span>

              {outcome.coverage !== "complete" && (
                <span
                  className={`workspace-badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${coverageToneClass(outcome.coverage)}`}
                >
                  <span>Coverage: {outcome.coverageLabel}</span>
                </span>
              )}

              {outcome.riskTier !== "UNAVAILABLE" && (
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  Risk tier: <span className="text-foreground">{outcome.riskTier}</span>
                </span>
              )}
            </div>

            <h2
              id="scan-outcome-heading"
              className="text-xl font-semibold tracking-[-0.015em] text-foreground sm:text-2xl"
            >
              {outcome.summary}
            </h2>

            <p className="font-mono text-xs text-muted-foreground break-all">
              Inspected: {outcome.inputLabel}
              {outcome.inputSizeBytes !== null
                ? ` (${formatBytes(outcome.inputSizeBytes)})`
                : ""}
              {outcome.latencyMs !== null
                ? ` · ${Math.round(outcome.latencyMs)} ms`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton
              variant="secondary"
              label="Copy report"
              ariaLabel="Copy scan report JSON"
              value={() => serializeScanSummaryReport(outcome)}
            />
            <button
              type="button"
              onClick={() => downloadScanSummaryReport(outcome)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border-control bg-surface px-3.5 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover active:bg-surface-selected"
            >
              <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span>Download report</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-outline bg-surface px-3.5 text-sm font-semibold text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground"
            >
              <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span>Scan another</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hairline-divided structured content — zero nested cards */}
      <div className="divide-y divide-outline">
        {/* Key quantitative indicators strip */}
        <dl className="grid grid-cols-2 divide-y divide-outline sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">Risk score</dt>
            <dd className="mt-1 font-mono text-base font-semibold text-foreground tabular-nums">
              {formatPercent(outcome.riskScore)}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">Confidence</dt>
            <dd className="mt-1 font-mono text-base font-semibold text-foreground tabular-nums">
              {formatPercent(outcome.confidence)}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">Coverage</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {outcome.coverageLabel}
            </dd>
          </div>
          <div className="px-5 py-3.5">
            <dt className="text-xs font-medium text-muted-foreground">Uncertainty</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {outcome.isUncertain ? "Elevated — review advised" : "Normal"}
            </dd>
          </div>
        </dl>

        {/* Coverage limitation or uncertainty callout */}
        {(outcome.coverageDetail || outcome.uncertaintyReasons.length > 0) && (
          <div className="flex items-start gap-3 bg-caution-bg/20 px-5 py-4 sm:px-6">
            <AlertOctagon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-caution"
              strokeWidth={1.75}
            />
            <div className="min-w-0 space-y-1.5 text-sm">
              {outcome.coverageDetail && (
                <p className="max-w-[70ch] text-foreground">{outcome.coverageDetail}</p>
              )}
              {outcome.uncertaintyReasons.length > 0 && (
                <ul className="list-disc space-y-1 ps-4 text-muted-foreground">
                  {outcome.uncertaintyReasons.map((reason, idx) => (
                    <li key={idx} className="break-words">
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Recommended next steps */}
        <div className="px-5 py-4 sm:px-6">
          <h3 className="text-sm font-semibold text-foreground">
            Recommended next steps
          </h3>
          <ul className="mt-2.5 space-y-2 text-sm text-foreground/90">
            {outcome.recommendedActions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span className="max-w-[70ch]">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Advisory-only disclaimer */}
        <div className="flex items-start gap-2.5 px-5 py-3.5 text-xs text-muted-foreground sm:px-6">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-info"
            strokeWidth={1.75}
          />
          <p className="max-w-[75ch]">{outcome.advisoryNotice}</p>
        </div>

        {/* Expandable technical evidence */}
        <ScanTechnicalDetails details={outcome.details} scanId={outcome.scanId} />
      </div>
    </section>
  );
}
