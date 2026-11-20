"use client";

import { AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { getFeatureDefinition } from "@/lib/features/catalog";
import type {
  ExecutionState,
  FeatureSlug,
  ScanApiResponse,
  ScanErrorResponse,
  ScanOutcome,
} from "@/lib/features/types";
import { AdvancedOptionsPanel } from "./advanced-options-panel";
import { FileDropzone } from "./file-dropzone";
import { ScanResultPanel } from "./scan-result-panel";

type FileFeatureSlug = Exclude<FeatureSlug, "sms">;

interface FileScannerWorkspaceProps {
  slug: FileFeatureSlug;
}

export function FileScannerWorkspace({ slug }: FileScannerWorkspaceProps) {
  const feature = getFeatureDefinition(slug);
  const baseId = useId();
  const submittingRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [execState, setExecState] = useState<ExecutionState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorResponse, setErrorResponse] = useState<ScanErrorResponse | null>(
    null,
  );
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [liveStatus, setLiveStatus] = useState("");

  // EXE advanced options (defaults match gateway contract)
  const [operatingPoint, setOperatingPoint] = useState<"fpr_1pct" | "fpr_0.1pct">(
    "fpr_1pct",
  );
  const [exeModelType, setExeModelType] = useState<"both" | "hybrid" | "gbdt">(
    "both",
  );
  const [exeThreshold, setExeThreshold] = useState("");
  const [exeDeepInspection, setExeDeepInspection] = useState(true);

  // PDF advanced options (defaults match gateway contract)
  const [pdfThreshold, setPdfThreshold] = useState("0.5");
  const [pdfEstimator, setPdfEstimator] = useState<
    "ensemble" | "rf" | "et" | "lr" | "lgbm"
  >("ensemble");
  const [pdfDeepInspection, setPdfDeepInspection] = useState(true);
  const [pdfIncludeFeatures, setPdfIncludeFeatures] = useState(false);

  async function runScan() {
    if (submittingRef.current) return;

    const nextErrors: Record<string, string> = {};
    if (!file) {
      nextErrors.file = `Select a file (${feature.formatLabel}) to inspect.`;
    } else if (file.size === 0) {
      nextErrors.file = "The selected file is empty (0 bytes). Choose a non-empty file.";
    } else if (
      feature.maxFileSizeBytes !== null &&
      file.size > feature.maxFileSizeBytes
    ) {
      nextErrors.file = `This file exceeds the ${feature.limitLabel} upload limit.`;
    }

    if (slug === "exe" && exeThreshold.trim() !== "") {
      const parsed = Number(exeThreshold.trim());
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        nextErrors.threshold = "Custom threshold must be a number between 0 and 1.";
      }
    }

    if (slug === "pdf" && pdfThreshold.trim() !== "") {
      const parsed = Number(pdfThreshold.trim());
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        nextErrors.threshold = "Custom threshold must be a number between 0 and 1.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorResponse(null);
      setExecState("idle");
      setLiveStatus("Please fix the highlighted fields before starting the scan.");
      return;
    }

    if (!file) return;

    submittingRef.current = true;
    setFieldErrors({});
    setErrorResponse(null);
    setExecState("submitting");
    setLiveStatus(`Validating and scanning ${file.name} statically. Please wait...`);

    const formData = new FormData();
    formData.append("file", file);

    if (slug === "exe") {
      formData.append("operatingPoint", operatingPoint);
      formData.append("modelType", exeModelType);
      if (exeThreshold.trim() !== "") {
        formData.append("threshold", exeThreshold.trim());
      }
      formData.append("deepInspection", String(exeDeepInspection));
    } else if (slug === "pdf") {
      if (pdfThreshold.trim() !== "") {
        formData.append("threshold", pdfThreshold.trim());
      }
      formData.append("estimator", pdfEstimator);
      formData.append("deepInspection", String(pdfDeepInspection));
      formData.append("includeFeatures", String(pdfIncludeFeatures));
    }

    try {
      const response = await fetch(feature.apiPath, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ScanApiResponse;
      if (!response.ok || data.status === "failed") {
        const err: ScanErrorResponse =
          data.status === "failed"
            ? data
            : {
                status: "failed",
                code: "upstream_error",
                message: "Could not complete this scan. Please try again.",
                retryable: true,
                diagnosticId: "client-fallback",
              };
        setErrorResponse(err);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        setExecState("failed");
        setLiveStatus(err.message);
        return;
      }

      setOutcome(data);
      setExecState("completed");
      setLiveStatus(`Scan completed: ${data.verdictLabel}.`);
    } catch {
      const networkErr: ScanErrorResponse = {
        status: "failed",
        code: "service_unavailable",
        message:
          "Network connection was interrupted before the scan finished. Your selected file and options were preserved — try again.",
        retryable: true,
        diagnosticId: "network-interrupted",
      };
      setErrorResponse(networkErr);
      setExecState("failed");
      setLiveStatus(networkErr.message);
    } finally {
      submittingRef.current = false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runScan();
  }

  function handleReset() {
    setFile(null);
    setOutcome(null);
    setErrorResponse(null);
    setFieldErrors({});
    setExecState("idle");
    setLiveStatus("Cleared previous scan. Ready to select another file.");
  }

  const isSubmitting = execState === "submitting";

  return (
    <div className="space-y-6">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="workspace-panel space-y-5 rounded-xl border border-outline bg-surface p-5 sm:p-6"
      >
        <FileDropzone
          label={`File to inspect (${feature.shortLabel})`}
          acceptedExtensions={feature.acceptedExtensions}
          formatLabel={feature.formatLabel}
          limitLabel={feature.limitLabel}
          file={file}
          disabled={isSubmitting}
          error={fieldErrors.file}
          onFileSelect={(next) => {
            setFile(next);
            setFieldErrors((prev) => ({ ...prev, file: "" }));
            setErrorResponse(null);
          }}
        />

        {slug === "exe" && (
          <AdvancedOptionsPanel summary="Tune false-alarm operating point, custom threshold, model mode, or deep static PE inspection">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  htmlFor={`${baseId}-op`}
                  className="text-sm font-semibold text-foreground"
                >
                  Sensitivity profile
                </label>
                <select
                  id={`${baseId}-op`}
                  value={operatingPoint}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setOperatingPoint(
                      e.currentTarget.value as "fpr_1pct" | "fpr_0.1pct",
                    )
                  }
                  className="min-h-11 rounded-xl border border-border-control bg-canvas px-3 text-sm text-foreground focus:border-accent disabled:opacity-60"
                >
                  <option value="fpr_1pct">Balanced (1% target false-alarm rate)</option>
                  <option value="fpr_0.1pct">Strict (0.1% target false-alarm rate)</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor={`${baseId}-model`}
                  className="text-sm font-semibold text-foreground"
                >
                  Analysis mode
                </label>
                <select
                  id={`${baseId}-model`}
                  value={exeModelType}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setExeModelType(
                      e.currentTarget.value as "both" | "hybrid" | "gbdt",
                    )
                  }
                  className="min-h-11 rounded-xl border border-border-control bg-canvas px-3 text-sm text-foreground focus:border-accent disabled:opacity-60"
                >
                  <option value="both">Combined ensemble (recommended)</option>
                  <option value="hybrid">Deep binary pattern analysis</option>
                  <option value="gbdt">Structural attribute analysis</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor={`${baseId}-exe-threshold`}
                  className="text-sm font-semibold text-foreground"
                >
                  Custom threshold (0–1, optional)
                </label>
                <input
                  id={`${baseId}-exe-threshold`}
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0"
                  max="1"
                  value={exeThreshold}
                  disabled={isSubmitting}
                  placeholder="Profile default"
                  aria-invalid={fieldErrors.threshold ? true : undefined}
                  onChange={(e) => {
                    setExeThreshold(e.currentTarget.value);
                    if (fieldErrors.threshold) {
                      setFieldErrors((prev) => ({ ...prev, threshold: "" }));
                    }
                  }}
                  className={`min-h-11 rounded-xl border bg-canvas px-3.5 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted-foreground/80 focus:border-accent disabled:opacity-60 ${
                    fieldErrors.threshold ? "border-danger" : "border-border-control"
                  }`}
                />
                {fieldErrors.threshold && (
                  <p role="alert" className="text-xs font-medium text-danger">
                    {fieldErrors.threshold}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-1 sm:pt-7">
                <input
                  id={`${baseId}-exe-deep`}
                  type="checkbox"
                  checked={exeDeepInspection}
                  disabled={isSubmitting}
                  onChange={(e) => setExeDeepInspection(e.currentTarget.checked)}
                  className="mt-1 size-5 cursor-pointer accent-primary"
                />
                <label
                  htmlFor={`${baseId}-exe-deep`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  <span className="block font-semibold">Deep static PE inspection</span>
                  <span className="block text-xs text-muted-foreground">
                    Include Authenticode status, section entropy, W+X checks, and API flags.
                  </span>
                </label>
              </div>
            </div>
          </AdvancedOptionsPanel>
        )}

        {slug === "pdf" && (
          <AdvancedOptionsPanel summary="Tune risk threshold, evaluation classifier, deep static inspection, or raw feature telemetry">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  htmlFor={`${baseId}-pdf-threshold`}
                  className="text-sm font-semibold text-foreground"
                >
                  Decision threshold (0–1)
                </label>
                <input
                  id={`${baseId}-pdf-threshold`}
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0"
                  max="1"
                  value={pdfThreshold}
                  disabled={isSubmitting}
                  aria-invalid={fieldErrors.threshold ? true : undefined}
                  onChange={(e) => {
                    setPdfThreshold(e.currentTarget.value);
                    if (fieldErrors.threshold) {
                      setFieldErrors((prev) => ({ ...prev, threshold: "" }));
                    }
                  }}
                  className={`min-h-11 rounded-xl border bg-canvas px-3.5 font-mono text-sm text-foreground focus:border-accent disabled:opacity-60 ${
                    fieldErrors.threshold ? "border-danger" : "border-border-control"
                  }`}
                />
                {fieldErrors.threshold && (
                  <p role="alert" className="text-xs font-medium text-danger">
                    {fieldErrors.threshold}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor={`${baseId}-pdf-est`}
                  className="text-sm font-semibold text-foreground"
                >
                  Evaluation mode
                </label>
                <select
                  id={`${baseId}-pdf-est`}
                  value={pdfEstimator}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setPdfEstimator(
                      e.currentTarget.value as
                        | "ensemble"
                        | "rf"
                        | "et"
                        | "lr"
                        | "lgbm",
                    )
                  }
                  className="min-h-11 rounded-xl border border-border-control bg-canvas px-3 text-sm text-foreground focus:border-accent disabled:opacity-60"
                >
                  <option value="ensemble">Combined ensemble (recommended)</option>
                  <option value="lgbm">Gradient boosted trees (LightGBM)</option>
                  <option value="rf">Random Forest</option>
                  <option value="et">Extra Trees</option>
                  <option value="lr">Logistic Regression</option>
                </select>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id={`${baseId}-pdf-deep`}
                  type="checkbox"
                  checked={pdfDeepInspection}
                  disabled={isSubmitting}
                  onChange={(e) => setPdfDeepInspection(e.currentTarget.checked)}
                  className="mt-1 size-5 cursor-pointer accent-primary"
                />
                <label
                  htmlFor={`${baseId}-pdf-deep`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  <span className="block font-semibold">Deep static PDF inspection</span>
                  <span className="block text-xs text-muted-foreground">
                    Extract document metadata, active-content counts, and inert URLs.
                  </span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id={`${baseId}-pdf-features`}
                  type="checkbox"
                  checked={pdfIncludeFeatures}
                  disabled={isSubmitting}
                  onChange={(e) => setPdfIncludeFeatures(e.currentTarget.checked)}
                  className="mt-1 size-5 cursor-pointer accent-primary"
                />
                <label
                  htmlFor={`${baseId}-pdf-features`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  <span className="block font-semibold">Include full static feature vector</span>
                  <span className="block text-xs text-muted-foreground">
                    Append all 131 extracted numeric features in Technical Evidence.
                  </span>
                </label>
              </div>
            </div>
          </AdvancedOptionsPanel>
        )}

        {errorResponse && (
          <div
            role="alert"
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-danger/40 bg-danger-bg/35 px-4 py-3 text-sm"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-danger"
                strokeWidth={1.75}
              />
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-foreground">{errorResponse.message}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Reference: {errorResponse.diagnosticId}
                </p>
              </div>
            </div>

            {errorResponse.retryable && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void runScan()}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-border-control bg-surface px-3.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
              >
                <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                <span>Try again</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-outline pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-hover active:bg-primary-pressed disabled:cursor-default disabled:bg-surface-raised disabled:text-muted-foreground"
          >
            <ShieldCheck aria-hidden="true" className="size-4" strokeWidth={1.75} />
            <span>
              {isSubmitting
                ? `Inspecting ${feature.shortLabel.toLowerCase()}...`
                : `Start ${feature.shortLabel.toLowerCase()} scan`}
            </span>
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div
          aria-busy="true"
          className="workspace-panel space-y-3 rounded-xl border border-info/35 bg-info-bg/25 p-5"
        >
          <p className="text-sm font-semibold text-info">
            Running static inspection without executing the uploaded file...
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="h-3 rounded bg-surface-hover motion-safe:animate-pulse" />
            <div className="h-3 rounded bg-surface-hover motion-safe:animate-pulse" />
            <div className="h-3 rounded bg-surface-hover motion-safe:animate-pulse" />
          </div>
        </div>
      )}

      {outcome && !isSubmitting && (
        <ScanResultPanel outcome={outcome} onReset={handleReset} />
      )}
    </div>
  );
}
