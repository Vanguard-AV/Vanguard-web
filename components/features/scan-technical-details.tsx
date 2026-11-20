"use client";

import { ChevronDown, Code2 } from "lucide-react";
import { useId, useState } from "react";
import { formatBytes, formatPercent } from "@/lib/features/catalog";
import type {
  AdvisoryVerdict,
  EmailScanDetails,
  ExeScanDetails,
  FeatureSpecificDetails,
  OfficeScanDetails,
  PdfScanDetails,
  SmsScanDetails,
  UrlScanDetails,
} from "@/lib/features/types";
import { CopyButton } from "./copy-button";

interface ScanTechnicalDetailsProps {
  details: FeatureSpecificDetails;
  scanId: string;
}

const DEFAULT_VISIBLE_ITEMS = 5;

function InertList({
  title,
  items,
  emptyLabel = "None found",
  mono = true,
  initialLimit = DEFAULT_VISIBLE_ITEMS,
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
  mono?: boolean;
  initialLimit?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > initialLimit;
  const visibleItems = showAll ? items : items.slice(0, initialLimit);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-muted-foreground tabular-nums">
          {title} ({items.length})
        </h4>
        {items.length > 1 && (
          <CopyButton
            value={items.join("\n")}
            label="Copy all"
            ariaLabel={`Copy all ${title.toLowerCase()}`}
          />
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <>
          <ul className="divide-y divide-outline/70 border-t border-outline/70">
            {visibleItems.map((item, index) => (
              <li
                key={`${title}-${index}`}
                className="flex min-w-0 items-center justify-between gap-2 py-0.5 text-xs text-foreground"
              >
                <span
                  title={item}
                  className={`min-w-0 flex-1 truncate py-1.5 ${
                    mono ? "font-mono" : ""
                  }`}
                >
                  {item}
                </span>
                <CopyButton
                  value={item}
                  ariaLabel={`Copy ${title.toLowerCase()} item ${index + 1}`}
                />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="border-t border-outline/70 pt-1">
              <button
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-accent motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover hover:text-foreground"
              >
                <span>
                  {showAll
                    ? "Show less"
                    : `Show all (${items.length}) · +${hiddenCount} more`}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-150 ${
                    showAll ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmailDetailsView({ details }: { details: EmailScanDetails }) {
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const hasMoreAttachments =
    details.attachments.length > DEFAULT_VISIBLE_ITEMS;
  const visibleAttachments = showAllAttachments
    ? details.attachments
    : details.attachments.slice(0, DEFAULT_VISIBLE_ITEMS);

  return (
    <div className="divide-y divide-outline">
      <div className="pb-4">
        <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Scoring mode</dt>
            <dd className="mt-0.5 font-mono text-foreground">{details.mode}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Policy action</dt>
            <dd className="mt-0.5 font-mono text-foreground">{details.action}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Decision threshold</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {details.threshold !== null ? details.threshold.toFixed(4) : "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Severe score</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {formatPercent(details.severeScore)}
            </dd>
          </div>
        </dl>

        {(details.modelVersion || details.policyVersion) && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Model: {details.modelVersion ?? "Unavailable"} · Policy:{" "}
            {details.policyVersion ?? "Unavailable"}
          </p>
        )}
      </div>

      {details.reasonCodes.length > 0 && (
        <div className="py-4">
          <InertList title="Reason codes" items={details.reasonCodes} />
        </div>
      )}

      <div className="grid gap-6 py-4 lg:grid-cols-2">
        <InertList
          title="Extracted email addresses (inert)"
          items={details.emailAddresses}
        />
        <InertList
          title="Extracted links (inert, non-clickable)"
          items={details.links}
        />
      </div>

      <div className="space-y-2 py-4">
        <h4 className="text-xs font-semibold text-muted-foreground tabular-nums">
          Attachments ({details.attachments.length})
        </h4>
        {details.attachments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No attachments detected.</p>
        ) : (
          <>
            <div className="workspace-scroll overflow-x-auto border-t border-outline/70">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-outline text-muted-foreground">
                  <tr>
                    <th className="py-2 pe-3 font-semibold">Filename</th>
                    <th className="px-3 py-2 font-semibold">MIME type</th>
                    <th className="px-3 py-2 font-semibold">Disposition</th>
                    <th className="py-2 ps-3 text-end font-semibold">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/70">
                  {visibleAttachments.map((att, idx) => (
                    <tr key={idx}>
                      <td
                        title={att.filename ?? "(unnamed)"}
                        className="max-w-[24ch] truncate py-2 pe-3 font-mono text-foreground sm:max-w-[36ch]"
                      >
                        {att.filename ?? "(unnamed)"}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {att.contentType}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {att.disposition ?? "—"}
                      </td>
                      <td className="py-2 ps-3 text-end font-mono text-foreground tabular-nums">
                        {formatBytes(att.sizeBytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMoreAttachments && (
              <div className="border-t border-outline/70 pt-1">
                <button
                  type="button"
                  aria-expanded={showAllAttachments}
                  onClick={() => setShowAllAttachments((prev) => !prev)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-accent motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover hover:text-foreground"
                >
                  <span>
                    {showAllAttachments
                      ? "Show less"
                      : `Show all (${details.attachments.length})`}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-150 ${
                      showAllAttachments ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Cleaned text used for scoring (inert excerpt)
          </h4>
          <CopyButton
            value={`Subject: ${details.cleanedSubject || "(empty)"}\n\n${details.cleanedBodyExcerpt || "(empty body)"}`}
            label="Copy excerpt"
            ariaLabel="Copy cleaned subject and body excerpt"
          />
        </div>
        <p className="text-xs">
          <span className="font-semibold text-muted-foreground">Subject: </span>
          <span className="font-mono text-foreground break-words">
            {details.cleanedSubject || "(empty)"}
          </span>
        </p>
        <pre className="workspace-scroll max-h-48 overflow-auto border-t border-outline/70 pt-2 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
          {details.cleanedBodyExcerpt || "(empty body)"}
        </pre>
      </div>
    </div>
  );
}

function ExeDetailsView({ details }: { details: ExeScanDetails }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Malware probability</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {formatPercent(details.malwareProbability)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Model disagreement</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {details.modelDisagreement !== null
              ? details.modelDisagreement.toFixed(4)
              : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Operating point</dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {details.operatingPoint ?? "Default"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Threshold</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {details.threshold !== null ? details.threshold.toFixed(4) : "Unavailable"}
          </dd>
        </div>
      </dl>

      {details.models && (
        <dl className="grid grid-cols-1 gap-3 rounded-lg border border-outline bg-canvas p-3 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Hybrid probability</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {formatPercent(details.models.hybridProbability)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">GBDT probability</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {formatPercent(details.models.gbdtProbability)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ensemble consensus</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {details.models.consensus ?? "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Active run</dt>
            <dd className="mt-0.5 font-mono text-foreground break-all">
              {details.models.activeRunId ?? "Unavailable"}
            </dd>
          </div>
        </dl>
      )}

      {details.hashes && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Cryptographic fingerprints
          </h4>
          <dl className="space-y-1 rounded-lg border border-outline bg-canvas p-3 font-mono text-xs">
            {(
              [
                ["SHA-256", details.hashes.sha256],
                ["SHA-1", details.hashes.sha1],
                ["MD5", details.hashes.md5],
                ["Imphash", details.hashes.imphash],
              ] as const
            )
              .filter(([, val]) => Boolean(val))
              .map(([label, val]) => (
                <div key={label} className="flex flex-wrap gap-x-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">{label}:</dt>
                  <dd className="min-w-0 flex-1 text-foreground break-all">{val}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {details.peHeaders && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            PE header & signature details
          </h4>
          <dl className="grid grid-cols-1 gap-2.5 rounded-lg border border-outline bg-canvas p-3 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Architecture / subsystem</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {[details.peHeaders.machine, details.peHeaders.subsystem]
                  .filter(Boolean)
                  .join(" · ") || "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Authenticode signature</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {details.peHeaders.isSigned === undefined
                  ? "Unavailable"
                  : details.peHeaders.isSigned
                    ? "Present"
                    : "Unsigned"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Compilation timestamp</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {details.peHeaders.compilationTimestamp ?? "Unavailable"}
                {details.peHeaders.isTimestomped ? " (timestomp anomaly)" : ""}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {details.sections.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            PE sections ({details.sections.length})
          </h4>
          <div className="workspace-scroll overflow-x-auto rounded-lg border border-outline">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-outline bg-surface-raised text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Section</th>
                  <th className="px-3 py-2 font-semibold">Entropy</th>
                  <th className="px-3 py-2 font-semibold">Raw size</th>
                  <th className="px-3 py-2 font-semibold">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline font-mono">
                {details.sections.map((sec, idx) => (
                  <tr key={`${sec.name}-${idx}`}>
                    <td className="px-3 py-2 text-foreground">{sec.name || "(unnamed)"}</td>
                    <td className="px-3 py-2 text-foreground tabular-nums">
                      {sec.entropy !== null ? sec.entropy.toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">
                      {formatBytes(sec.rawSize)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {[
                        sec.isRead ? "R" : "",
                        sec.isWrite ? "W" : "",
                        sec.isExec ? "X" : "",
                        sec.isWx ? "(W+X)" : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {details.securityIndicators && (
        <div className="grid gap-4 lg:grid-cols-2">
          <InertList
            title="Heuristic flags & indicators"
            items={[
              ...details.securityIndicators.heuristicRedFlags,
              ...details.securityIndicators.topIndicators,
            ]}
            mono={false}
          />
          <InertList
            title="Flagged system APIs"
            items={details.securityIndicators.suspiciousApis}
          />
        </div>
      )}

      {details.topFactors.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Top explanation factors
          </h4>
          <ul className="space-y-1.5">
            {details.topFactors.slice(0, 10).map((factor, idx) => (
              <li
                key={`${factor.feature}-${idx}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-outline bg-canvas px-3 py-2 text-xs"
              >
                <span className="font-mono text-foreground break-all">
                  {factor.feature}
                </span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {factor.direction}
                  {factor.contribution !== null
                    ? ` (${factor.contribution.toFixed(4)})`
                    : ""}
                </span>
                {factor.description && (
                  <span className="w-full text-muted-foreground">{factor.description}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OfficeDetailsView({ details }: { details: OfficeScanDetails }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Observed format</dt>
          <dd className="mt-0.5 font-mono text-foreground">{details.observedFormat}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Raw scan status</dt>
          <dd className="mt-0.5 font-mono text-foreground">{details.rawScanStatus}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Branch disagreement</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {details.disagreement !== null
              ? details.disagreement.toFixed(4)
              : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Model version</dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {details.modelVersion ?? "Unavailable"}
          </dd>
        </div>
      </dl>

      {details.primaryAttribution && (
        <div className="rounded-lg border border-outline bg-canvas px-3.5 py-3 text-xs">
          <p className="font-semibold text-foreground">
            Primary threat attribution:{" "}
            <span className="font-mono text-caution">{details.primaryAttribution}</span>
            {details.primaryAttributionScore !== null
              ? ` (${formatPercent(details.primaryAttributionScore)})`
              : ""}
          </p>
          {details.lowConfidenceAttribution && (
            <p className="mt-1 text-muted-foreground">
              Attribution confidence is low — treat the family label as advisory only.
            </p>
          )}
        </div>
      )}

      {details.threatCategories.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            9-class threat attribution scores
          </h4>
          <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {details.threatCategories.map(({ category, score }) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-md border border-outline bg-canvas px-2.5 py-1.5 font-mono text-xs"
              >
                <dt className="truncate text-muted-foreground">{category}</dt>
                <dd className="text-foreground tabular-nums">{formatPercent(score)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {details.modalityAvailability && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Static modality coverage
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(details.modalityAvailability).map(([mod, available]) => (
              <span
                key={mod}
                className="rounded-md border border-outline bg-canvas px-2.5 py-1 font-mono text-xs text-foreground"
              >
                Modality {mod}: {available ? "Inspected" : "Unavailable"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <InertList title="Reason codes" items={details.reasonCodes} />
        <InertList title="Format candidates" items={details.formatCandidates} />
      </div>
    </div>
  );
}

function PdfDetailsView({ details }: { details: PdfScanDetails }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Malicious probability</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {formatPercent(details.maliciousProbability)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estimator</dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {details.estimatorUsed ?? "ensemble"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Decision threshold</dt>
          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
            {details.threshold !== null ? details.threshold.toFixed(4) : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Ensemble consensus</dt>
          <dd className="mt-0.5 font-mono text-foreground">
            {details.models?.consensus ?? "Unavailable"}
          </dd>
        </div>
      </dl>

      {details.metadata && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">PDF metadata</h4>
          <dl className="grid grid-cols-2 gap-2.5 rounded-lg border border-outline bg-canvas p-3 text-xs sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">PDF version</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {details.metadata.pdfVersion ?? "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pages</dt>
              <dd className="mt-0.5 font-mono text-foreground tabular-nums">
                {details.metadata.numPages ?? "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Encrypted</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {details.metadata.isEncrypted ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Parsed cleanly</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {details.metadata.parseSuccess ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
          {details.metadata.parserErrors.length > 0 && (
            <InertList
              title="Parser notices"
              items={details.metadata.parserErrors}
              mono={false}
            />
          )}
        </div>
      )}

      {details.securityIndicators && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground">
              Active-content indicators
            </h4>
            <dl className="grid grid-cols-2 gap-2 rounded-lg border border-outline bg-canvas p-3 font-mono text-xs sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">JavaScript</dt>
                <dd className="mt-0.5 text-foreground tabular-nums">
                  {details.securityIndicators.javascriptCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">OpenAction / AA</dt>
                <dd className="mt-0.5 text-foreground tabular-nums">
                  {details.securityIndicators.openActionCount} /{" "}
                  {details.securityIndicators.aaCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Launch / Embedded</dt>
                <dd className="mt-0.5 text-foreground tabular-nums">
                  {details.securityIndicators.launchCount} /{" "}
                  {details.securityIndicators.embeddedFileCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">AcroForm / XFA / URI</dt>
                <dd className="mt-0.5 text-foreground tabular-nums">
                  {details.securityIndicators.acroFormCount} /{" "}
                  {details.securityIndicators.xfaCount} /{" "}
                  {details.securityIndicators.uriCount}
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InertList
              title="Extracted URLs (inert, non-clickable)"
              items={details.securityIndicators.extractedUrls}
            />
            <InertList
              title="Heuristic flags & suspicious strings"
              items={[
                ...details.securityIndicators.heuristicRedFlags,
                ...details.securityIndicators.suspiciousStrings,
              ]}
            />
          </div>
        </div>
      )}

      {details.hashes && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Cryptographic fingerprints
          </h4>
          <dl className="space-y-1 rounded-lg border border-outline bg-canvas p-3 font-mono text-xs">
            {(
              [
                ["SHA-256", details.hashes.sha256],
                ["SHA-1", details.hashes.sha1],
                ["MD5", details.hashes.md5],
              ] as const
            )
              .filter(([, val]) => Boolean(val))
              .map(([label, val]) => (
                <div key={label} className="flex flex-wrap gap-x-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">{label}:</dt>
                  <dd className="min-w-0 flex-1 text-foreground break-all">{val}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {details.topContributingFeatures.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Top contributing risk features
          </h4>
          <ul className="space-y-1.5">
            {details.topContributingFeatures.slice(0, 12).map((item, idx) => (
              <li
                key={`${item.feature}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-outline bg-canvas px-3 py-1.5 font-mono text-xs"
              >
                <span className="text-foreground break-all">{item.feature}</span>
                <span className="text-muted-foreground tabular-nums">
                  val={item.value ?? "—"} · {item.direction}
                  {item.contribution !== null
                    ? ` (${item.contribution.toFixed(4)})`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {details.rawFeatures && Object.keys(details.rawFeatures).length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Extracted static feature vector ({Object.keys(details.rawFeatures).length})
          </h4>
          <pre className="workspace-scroll max-h-56 overflow-auto rounded-lg border border-outline bg-canvas p-3 font-mono text-xs text-muted-foreground">
            {JSON.stringify(details.rawFeatures, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function verdictPillClass(verdict: AdvisoryVerdict): string {
  if (verdict === "malicious") {
    return "border-danger/35 bg-danger-bg text-danger";
  }
  if (verdict === "review") {
    return "border-caution/35 bg-caution-bg text-caution";
  }
  return "border-positive/35 bg-positive-bg text-positive";
}

function SmsDetailsView({ details }: { details: SmsScanDetails }) {
  const singleItem =
    details.mode === "single" && details.items.length === 1
      ? details.items[0]
      : null;

  return (
    <div className="divide-y divide-outline">
      <div className="pb-4">
        <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Model</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {details.modelId ?? "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Decision threshold</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {details.thresholdUsed !== null
                ? details.thresholdUsed.toFixed(4)
                : "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Inspection mode</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {details.mode === "batch"
                ? `Batch (${details.items.length} messages)`
                : "Single message"}
            </dd>
          </div>
          {singleItem && (
            <div>
              <dt className="text-muted-foreground">Language & script</dt>
              <dd className="mt-0.5 font-mono text-foreground">
                {[singleItem.language, singleItem.script]
                  .filter(Boolean)
                  .join(" · ") || "Unavailable"}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {details.batchSummary && (
        <dl className="grid grid-cols-2 gap-4 py-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Total checked</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground tabular-nums">
              {details.batchSummary.totalMessages}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Flagged spam / smishing</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-danger tabular-nums">
              {details.batchSummary.spamCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Clean</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-positive tabular-nums">
              {details.batchSummary.hamCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Uncertain / review</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-caution tabular-nums">
              {details.batchSummary.uncertainCount}
            </dd>
          </div>
        </dl>
      )}

      {singleItem ? (
        <>
          {(singleItem.looksLikeOtp ||
            singleItem.hasObfuscation ||
            singleItem.truncatedMiddle ||
            singleItem.heuristicSignals.length > 0) && (
            <div className="space-y-2 py-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {singleItem.looksLikeOtp && <span>OTP pattern detected</span>}
                {singleItem.hasObfuscation && (
                  <span className="text-caution">
                    Obfuscation / lookalike cues detected
                  </span>
                )}
                {singleItem.truncatedMiddle && (
                  <span>Dual-window scoring applied (long message)</span>
                )}
              </div>
              {singleItem.heuristicSignals.length > 0 && (
                <InertList
                  title="Heuristic signals"
                  items={singleItem.heuristicSignals}
                  mono={false}
                />
              )}
            </div>
          )}

          <div className="grid gap-6 py-4 lg:grid-cols-2">
            <InertList
              title="Extracted URLs (inert, non-clickable)"
              items={Array.from(
                new Set([
                  ...singleItem.entities.urls,
                  ...singleItem.entities.shortenedUrls,
                ]),
              )}
            />
            <InertList
              title="Extracted phone numbers (inert)"
              items={singleItem.entities.phoneNumbers}
            />
          </div>

          {(singleItem.entities.emails.length > 0 ||
            singleItem.entities.otpCodes.length > 0) && (
            <div className="grid gap-6 py-4 lg:grid-cols-2">
              <InertList
                title="Extracted email addresses (inert)"
                items={singleItem.entities.emails}
              />
              <InertList
                title="Verification codes"
                items={singleItem.entities.otpCodes}
              />
            </div>
          )}

          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-muted-foreground">
                Inspected SMS text (inert excerpt)
              </h4>
              <CopyButton
                value={singleItem.textExcerpt}
                label="Copy excerpt"
                ariaLabel="Copy inspected SMS text excerpt"
              />
            </div>
            <pre
              dir="auto"
              className="workspace-scroll max-h-48 overflow-auto border-t border-outline/70 pt-2 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground"
            >
              {singleItem.textExcerpt || "(empty message)"}
            </pre>
          </div>
        </>
      ) : (
        <div className="divide-y divide-outline/70 pt-2">
          {details.items.map((item) => {
            const allUrls = Array.from(
              new Set([
                ...item.entities.urls,
                ...item.entities.shortenedUrls,
              ]),
            );
            return (
              <div key={item.index} className="space-y-2.5 py-4 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground tabular-nums">
                      #{item.index + 1}
                    </span>
                    {item.id && (
                      <span className="font-mono text-muted-foreground break-all">
                        ID: {item.id}
                      </span>
                    )}
                    {item.sender && (
                      <span className="font-mono text-foreground break-all">
                        Sender: {item.sender}
                      </span>
                    )}
                    <span
                      className={`workspace-badge inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${verdictPillClass(item.verdict)}`}
                    >
                      {item.verdict === "malicious"
                        ? "Spam / Smishing"
                        : item.verdict === "review"
                          ? "Needs review"
                          : "Clean"}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Risk: {item.riskTier}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-foreground tabular-nums">
                    Spam score: {formatPercent(item.spamProbability)}
                  </span>
                </div>

                <pre
                  dir="auto"
                  className="border-t border-outline/70 pt-2 font-mono text-xs text-foreground whitespace-pre-wrap break-words"
                >
                  {item.textExcerpt}
                </pre>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Language: {item.language ?? "Unavailable"}</span>
                  <span>Script: {item.script ?? "Unavailable"}</span>
                  {item.looksLikeOtp && <span>OTP pattern detected</span>}
                  {item.hasObfuscation && (
                    <span className="text-caution">
                      Obfuscation / lookalike cues
                    </span>
                  )}
                  {item.truncatedMiddle && (
                    <span>Dual-window scoring applied (long message)</span>
                  )}
                </div>

                {(allUrls.length > 0 ||
                  item.entities.phoneNumbers.length > 0 ||
                  item.entities.emails.length > 0 ||
                  item.entities.otpCodes.length > 0 ||
                  item.heuristicSignals.length > 0) && (
                  <div className="grid gap-4 pt-1 sm:grid-cols-2">
                    {allUrls.length > 0 && (
                      <InertList
                        title="Extracted URLs (inert)"
                        items={allUrls}
                      />
                    )}
                    {item.entities.phoneNumbers.length > 0 && (
                      <InertList
                        title="Phone numbers (inert)"
                        items={item.entities.phoneNumbers}
                      />
                    )}
                    {item.entities.emails.length > 0 && (
                      <InertList
                        title="Email addresses (inert)"
                        items={item.entities.emails}
                      />
                    )}
                    {item.entities.otpCodes.length > 0 && (
                      <InertList
                        title="Verification codes"
                        items={item.entities.otpCodes}
                      />
                    )}
                    {item.heuristicSignals.length > 0 && (
                      <InertList
                        title="Heuristic signals"
                        items={item.heuristicSignals}
                        mono={false}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BRANCH_LABELS: Record<string, string> = {
  byte: "Byte Transformer",
  subword: "Subword RoBERTa",
  catboost_d6: "CatBoost (depth 6)",
  catboost_d8: "CatBoost (depth 8)",
  tfidf: "Char N-gram TF-IDF",
};

function UrlDetailsView({ details }: { details: UrlScanDetails }) {
  return (
    <div className="divide-y divide-outline">
      <div className="pb-4">
        <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Model & route</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {[details.modelId, details.route ? `route:${details.route}` : null]
                .filter(Boolean)
                .join(" · ") || "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Threshold applied</dt>
            <dd className="mt-0.5 font-mono text-foreground tabular-nums">
              {details.thresholdUsed !== null
                ? `${details.thresholdUsed.toFixed(4)}${details.thresholdOverridden ? " (custom)" : details.thresholdSource ? ` (${details.thresholdSource})` : " (default)"}`
                : "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bundle policy</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {[details.policyMode, details.policyStatus]
                .filter(Boolean)
                .join(" · ") || "shadow_only"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Inspection mode</dt>
            <dd className="mt-0.5 font-mono text-foreground">
              {details.mode === "batch"
                ? `Batch (${details.items.length} URLs)`
                : "Single URL"}
            </dd>
          </div>
        </dl>

        {(details.bundleId || details.policyVersion) && (
          <p className="mt-3 font-mono text-xs text-muted-foreground break-all">
            {details.bundleId ? `Bundle: ${details.bundleId.slice(0, 16)}` : ""}
            {details.bundleId && details.policyVersion ? " · " : ""}
            {details.policyVersion
              ? `Policy SHA: ${details.policyVersion.slice(0, 16)}`
              : ""}
          </p>
        )}
      </div>

      {details.batchSummary && (
        <dl className="grid grid-cols-3 gap-4 py-4 text-xs">
          <div>
            <dt className="text-muted-foreground">Total checked</dt>
            <dd className="mt-0.5 font-mono text-base font-semibold text-foreground tabular-nums">
              {details.batchSummary.totalUrls}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Malicious</dt>
            <dd className="mt-0.5 font-mono text-base font-semibold text-danger tabular-nums">
              {details.batchSummary.maliciousCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Benign</dt>
            <dd className="mt-0.5 font-mono text-base font-semibold text-positive tabular-nums">
              {details.batchSummary.benignCount}
            </dd>
          </div>
        </dl>
      )}

      <div className="divide-y divide-outline">
        {details.items.map((item) => {
          const branchEntries = item.branches
            ? Object.entries(item.branches.branchProbabilities)
            : [];
          const lexicalEntries = item.lexicalFeatures
            ? Object.entries(item.lexicalFeatures)
            : [];

          return (
            <div key={item.index} className="space-y-3.5 py-4 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-muted-foreground tabular-nums">
                    #{item.index + 1}
                  </span>
                  {item.id && (
                    <span className="font-mono text-muted-foreground break-all">
                      ID: {item.id}
                    </span>
                  )}
                  <span
                    className={`workspace-badge inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${verdictPillClass(item.verdict)}`}
                  >
                    {item.verdict === "malicious" ? "Malicious" : "Benign"}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Risk: <span className="text-foreground">{item.riskTier}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Input: <span className="text-foreground">{item.inputKind}</span>
                  </span>
                  {item.parsedUrl?.isIp && (
                    <span className="workspace-badge inline-flex items-center rounded-full border border-caution/35 bg-caution-bg px-2 py-0.5 font-mono text-xs text-caution">
                      IP literal host
                    </span>
                  )}
                  {item.parsedUrl?.isIdna && (
                    <span className="workspace-badge inline-flex items-center rounded-full border border-caution/35 bg-caution-bg px-2 py-0.5 font-mono text-xs text-caution">
                      IDNA / punycode
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 font-mono text-xs tabular-nums">
                  <span className="text-foreground">
                    Malicious prob: {formatPercent(item.maliciousProbability)}
                  </span>
                  {item.predictionEntropy !== null && (
                    <span className="text-muted-foreground">
                      Entropy: {item.predictionEntropy.toFixed(3)} nats
                    </span>
                  )}
                </div>
              </div>

              {/* Inert URL display row */}
              <div className="flex min-w-0 items-center justify-between gap-2 border-t border-outline/70 pt-2">
                <span className="min-w-0 flex-1 font-mono text-xs text-foreground break-all">
                  {item.url || "(empty)"}
                </span>
                {item.url && (
                  <CopyButton
                    value={item.url}
                    ariaLabel={`Copy inert URL #${item.index + 1}`}
                  />
                )}
              </div>

              {/* Parsed WHATWG URL components */}
              {item.parsedUrl && (
                <div className="space-y-1.5 border-t border-outline/70 pt-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground">
                    WHATWG URL anatomy (offline parse: {item.parsedUrl.status} ·{" "}
                    <span className="font-mono">{item.parsedUrl.reasonCode}</span>)
                  </h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 font-mono text-xs sm:grid-cols-3 lg:grid-cols-6">
                    <div>
                      <dt className="font-sans text-muted-foreground">Scheme</dt>
                      <dd className="mt-0.5 text-foreground">
                        {item.parsedUrl.scheme || "(bare host)"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-muted-foreground">Host</dt>
                      <dd className="mt-0.5 text-foreground break-all">
                        {item.parsedUrl.host || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-muted-foreground">Model host</dt>
                      <dd className="mt-0.5 text-foreground break-all">
                        {item.parsedUrl.modelHost || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-muted-foreground">Public suffix</dt>
                      <dd className="mt-0.5 text-foreground">
                        {item.parsedUrl.suffix || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-muted-foreground">Port</dt>
                      <dd className="mt-0.5 text-foreground tabular-nums">
                        {item.parsedUrl.port ?? "Default"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-sans text-muted-foreground">Form</dt>
                      <dd className="mt-0.5 text-foreground">
                        {item.parsedUrl.inputForm}
                      </dd>
                    </div>
                    {item.parsedUrl.path && (
                      <div className="col-span-2 sm:col-span-3">
                        <dt className="font-sans text-muted-foreground">Path (inert)</dt>
                        <dd className="mt-0.5 text-foreground break-all">
                          {item.parsedUrl.path}
                        </dd>
                      </div>
                    )}
                    {item.parsedUrl.query && (
                      <div className="col-span-2 sm:col-span-3">
                        <dt className="font-sans text-muted-foreground">Query (inert)</dt>
                        <dd className="mt-0.5 text-foreground break-all">
                          {item.parsedUrl.query}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {item.parsedUrl.modelText && (
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      Canonical model input:{" "}
                      <span className="text-foreground">{item.parsedUrl.modelText}</span>
                    </p>
                  )}
                </div>
              )}

              {/* 5-Branch Ensemble Breakdown */}
              {branchEntries.length > 0 && item.branches && (
                <div className="space-y-1.5 border-t border-outline/70 pt-2.5">
                  <h4 className="text-xs font-semibold text-muted-foreground">
                    5-branch fusion breakdown (route:{" "}
                    <span className="font-mono text-foreground">
                      {item.branches.route}
                    </span>
                    {item.branches.fusionLogit !== null
                      ? ` · fused logit: ${item.branches.fusionLogit.toFixed(4)}`
                      : ""}
                    )
                  </h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 text-xs sm:grid-cols-3 lg:grid-cols-5">
                    {branchEntries.map(([branchKey, prob]) => {
                      const logit = item.branches?.branchLogits[branchKey];
                      return (
                        <div key={branchKey}>
                          <dt className="truncate text-muted-foreground">
                            {BRANCH_LABELS[branchKey] ?? branchKey}
                          </dt>
                          <dd className="mt-0.5 font-mono text-foreground tabular-nums">
                            {formatPercent(prob)}
                            {typeof logit === "number" && (
                              <span className="ms-1.5 text-[0.6875rem] text-muted-foreground">
                                ({logit >= 0 ? "+" : ""}
                                {logit.toFixed(2)})
                              </span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              )}

              {/* 18 Static Lexical Features */}
              {lexicalEntries.length > 0 && (
                <details className="group border-t border-outline/70 pt-2">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-xs font-semibold text-accent hover:text-foreground">
                    <span>
                      Static lexical features ({lexicalEntries.length})
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-3.5 shrink-0 motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-180"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-outline/60 pt-2 font-mono text-xs sm:grid-cols-3 lg:grid-cols-6">
                    {lexicalEntries.map(([featKey, featVal]) => (
                      <div key={featKey} className="flex items-baseline justify-between gap-2">
                        <dt className="truncate text-muted-foreground" title={featKey}>
                          {featKey}
                        </dt>
                        <dd className="shrink-0 text-foreground tabular-nums">
                          {Number.isInteger(featVal)
                            ? featVal
                            : featVal.toFixed(3)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScanTechnicalDetails({
  details,
  scanId,
}: ScanTechnicalDetailsProps) {
  const [open, setOpen] = useState(
    details.kind === "email" ||
      details.kind === "sms" ||
      details.kind === "url",
  );
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-start text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover sm:px-6"
      >
        <span className="flex items-center gap-2">
          <Code2
            aria-hidden="true"
            className="size-4 shrink-0 text-accent"
            strokeWidth={1.75}
          />
          <span>
            {details.kind === "sms" && details.mode === "batch"
              ? `Batch breakdown & technical evidence (${details.items.length} messages)`
              : details.kind === "url" && details.mode === "batch"
                ? `Batch breakdown & WHATWG URL evidence (${details.items.length} URLs)`
                : "Technical evidence & extracted artifacts"}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-150 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="border-t border-outline bg-surface-raised/45 px-5 py-5 sm:px-6"
      >
        {details.kind === "email" && <EmailDetailsView details={details} />}
        {details.kind === "exe" && <ExeDetailsView details={details} />}
        {details.kind === "office" && <OfficeDetailsView details={details} />}
        {details.kind === "pdf" && <PdfDetailsView details={details} />}
        {details.kind === "sms" && <SmsDetailsView details={details} />}
        {details.kind === "url" && <UrlDetailsView details={details} />}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-outline pt-3">
          <p className="font-mono text-[0.75rem] text-muted-foreground">
            Transient scan reference: <span className="text-foreground">{scanId}</span>
          </p>
          <CopyButton
            value={scanId}
            label="Copy ID"
            ariaLabel="Copy transient scan reference ID"
          />
        </div>
      </div>
    </div>
  );
}
