import type { ScanOutcome } from "./types.ts";

export function buildReportFilename(outcome: ScanOutcome): string {
  const safeTimestamp = outcome.analyzedAt
    .replace(/[:.]/g, "-")
    .replace(/[^0-9A-Za-z_-]/g, "")
    .slice(0, 19);
  return `vanguard-${outcome.feature}-report-${safeTimestamp || "scan"}.json`;
}

export function serializeScanSummaryReport(outcome: ScanOutcome): string {
  const payload = {
    schema: "vanguard-av.scan-summary/v1",
    exportedAt: new Date().toISOString(),
    advisoryNotice: outcome.advisoryNotice,
    scanId: outcome.scanId,
    feature: outcome.feature,
    analyzedAt: outcome.analyzedAt,
    inputLabel: outcome.inputLabel,
    inputSizeBytes: outcome.inputSizeBytes,
    executionState: outcome.status,
    verdict: outcome.verdict,
    verdictLabel: outcome.verdictLabel,
    coverage: outcome.coverage,
    coverageLabel: outcome.coverageLabel,
    coverageDetail: outcome.coverageDetail,
    riskTier: outcome.riskTier,
    riskScore: outcome.riskScore,
    confidence: outcome.confidence,
    isUncertain: outcome.isUncertain,
    uncertaintyReasons: outcome.uncertaintyReasons,
    summary: outcome.summary,
    recommendedActions: outcome.recommendedActions,
    latencyMs: outcome.latencyMs,
    details: outcome.details,
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadScanSummaryReport(outcome: ScanOutcome): void {
  const blob = new Blob([serializeScanSummaryReport(outcome)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = buildReportFilename(outcome);
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}
