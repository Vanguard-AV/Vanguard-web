"use client";

import { AlertCircle, Paperclip, RefreshCw, X } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  FIVE_MIB,
  SMS_MAX_BATCH_ITEMS,
  SMS_MAX_TEXT_LENGTH,
  formatBytes,
  getFeatureDefinition,
} from "@/lib/features/catalog";
import type {
  ExecutionState,
  ScanApiResponse,
  ScanErrorResponse,
  ScanOutcome,
} from "@/lib/features/types";
import { CopyButton } from "./copy-button";
import { ScanResultPanel } from "./scan-result-panel";

type SmsMode = "single" | "batch";

export function SmsScannerWorkspace() {
  const feature = getFeatureDefinition("sms");
  const baseId = useId();
  const singleInputId = `${baseId}-sms-single`;
  const batchInputId = `${baseId}-sms-batch`;
  const fileInputId = `${baseId}-sms-file`;
  const errorId = `${baseId}-sms-error`;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const [mode, setMode] = useState<SmsMode>("single");
  const [singleText, setSingleText] = useState("");
  const [batchText, setBatchText] = useState("");
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const [execState, setExecState] = useState<ExecutionState>("idle");
  const [fieldError, setFieldError] = useState<string>("");
  const [errorResponse, setErrorResponse] = useState<ScanErrorResponse | null>(
    null,
  );
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [liveStatus, setLiveStatus] = useState("");

  const isSubmitting = execState === "submitting";

  const parsedBatchLines = batchText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  function selectBatchFile(next: File | null) {
    setBatchFile(next);
    setFieldError("");
    setErrorResponse(null);
    if (next) {
      setMode("batch");
      setLiveStatus(`Selected ${next.name} (${formatBytes(next.size)}).`);
    }
  }

  function openFilePicker() {
    if (isSubmitting) return;
    fileInputRef.current?.click();
  }

  function clearBatchFile() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setBatchFile(null);
    setFieldError("");
    setErrorResponse(null);
    setLiveStatus("Removed batch file. Ready for pasted batch messages.");
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSubmitting) setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setDragging(false);
    if (isSubmitting) return;
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (dropped) {
      selectBatchFile(dropped);
    }
  }

  async function runScan() {
    if (submittingRef.current) return;

    if (mode === "single") {
      const trimmed = singleText.trim();
      if (!trimmed) {
        setFieldError("Paste or type an SMS message to inspect.");
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("Enter an SMS message before starting the scan.");
        return;
      }
      if (singleText.length > SMS_MAX_TEXT_LENGTH) {
        setFieldError(
          `SMS messages must be ${SMS_MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
        );
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("SMS message exceeds the character limit.");
        return;
      }
    } else if (batchFile) {
      if (batchFile.size === 0) {
        setFieldError(
          "The selected batch file is empty (0 bytes). Choose a non-empty file.",
        );
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("Selected batch file is empty.");
        return;
      }
      if (batchFile.size > FIVE_MIB) {
        setFieldError("SMS batch import files must be 5 MiB or smaller.");
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("Selected batch file exceeds the 5 MiB limit.");
        return;
      }
    } else {
      if (parsedBatchLines.length === 0) {
        setFieldError(
          "Enter at least one SMS message (one per line) or import a batch file.",
        );
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("Provide batch messages or import a batch file.");
        return;
      }
      if (parsedBatchLines.length > SMS_MAX_BATCH_ITEMS) {
        setFieldError(
          `Batch scans accept at most ${SMS_MAX_BATCH_ITEMS} messages at a time (currently ${parsedBatchLines.length}).`,
        );
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus("Batch exceeds the 256-message limit.");
        return;
      }
      const tooLongIdx = parsedBatchLines.findIndex(
        (line) => line.length > SMS_MAX_TEXT_LENGTH,
      );
      if (tooLongIdx !== -1) {
        setFieldError(
          `Line #${tooLongIdx + 1} exceeds the ${SMS_MAX_TEXT_LENGTH.toLocaleString()}-character limit.`,
        );
        setErrorResponse(null);
        setExecState("idle");
        setLiveStatus(
          `Line #${tooLongIdx + 1} exceeds the character limit.`,
        );
        return;
      }
    }

    submittingRef.current = true;
    setFieldError("");
    setErrorResponse(null);
    setExecState("submitting");
    setLiveStatus(
      mode === "batch"
        ? "Scanning SMS batch statically. Please wait..."
        : "Scanning SMS message statically. Please wait...",
    );

    try {
      let response: Response;
      if (mode === "batch" && batchFile) {
        const formData = new FormData();
        formData.append("file", batchFile);
        formData.append("includeDetails", "true");

        response = await fetch(feature.apiPath, {
          method: "POST",
          body: formData,
        });
      } else if (mode === "batch") {
        response = await fetch(feature.apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "batch",
            messages: parsedBatchLines.map((text) => ({ text })),
            includeDetails: true,
          }),
        });
      } else {
        response = await fetch(feature.apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "single",
            text: singleText.trim(),
            includeDetails: true,
          }),
        });
      }

      const data = (await response.json()) as ScanApiResponse;

      if (!response.ok || data.status === "failed") {
        const err: ScanErrorResponse =
          data.status === "failed"
            ? data
            : {
                status: "failed",
                code: "upstream_error",
                message: "Could not complete the SMS scan. Please try again.",
                retryable: true,
                diagnosticId: "client-fallback",
              };
        setErrorResponse(err);
        const firstFieldErr = err.fieldErrors
          ? Object.values(err.fieldErrors)[0]
          : undefined;
        if (firstFieldErr) {
          setFieldError(firstFieldErr);
        }
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
          "Network connection was interrupted before the scan finished. Your SMS input is preserved — try again.",
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOutcome(null);
    setErrorResponse(null);
    setFieldError("");
    setExecState("idle");
    setSingleText("");
    setBatchText("");
    setBatchFile(null);
    setLiveStatus("Cleared previous scan. Ready for a new SMS check.");
  }

  return (
    <div className="space-y-6">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </p>

      <form
        id="features-sms-workbench"
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        noValidate
        className={`workspace-panel overflow-hidden rounded-xl border bg-surface motion-safe:transition-colors motion-safe:duration-150 ${
          fieldError
            ? "border-danger"
            : dragging
              ? "border-accent bg-surface-selected/40"
              : "border-outline"
        }`}
      >
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept={feature.acceptedExtensions.join(",")}
          disabled={isSubmitting}
          className="sr-only"
          onChange={(event) => {
            const chosen = event.currentTarget.files?.[0] ?? null;
            selectBatchFile(chosen);
          }}
        />

        {/* Top hairline bar: mode tabs + live counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline px-5 py-2.5 sm:px-6">
          <div
            role="group"
            aria-label="Inspection mode"
            className="flex flex-wrap items-center gap-1"
          >
            <button
              type="button"
              disabled={isSubmitting}
              aria-pressed={mode === "single"}
              onClick={() => {
                setMode("single");
                setFieldError("");
                setErrorResponse(null);
              }}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ${
                mode === "single"
                  ? "workspace-nav-active bg-surface-selected text-accent"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              Single message
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              aria-pressed={mode === "batch"}
              onClick={() => {
                setMode("batch");
                setFieldError("");
                setErrorResponse(null);
              }}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ${
                mode === "batch"
                  ? "workspace-nav-active bg-surface-selected text-accent"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              Batch (up to {SMS_MAX_BATCH_ITEMS})
            </button>
          </div>

          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {mode === "single"
              ? `${singleText.length.toLocaleString()} / ${SMS_MAX_TEXT_LENGTH.toLocaleString()} chars`
              : batchFile
                ? formatBytes(batchFile.size)
                : `${parsedBatchLines.length} / ${SMS_MAX_BATCH_ITEMS} messages`}
          </span>
        </div>

        {/* Main input body */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {mode === "single" ? (
            <div className="space-y-2">
              <label
                htmlFor={singleInputId}
                className="block text-sm font-semibold text-foreground"
              >
                SMS message
              </label>
              <textarea
                id={singleInputId}
                dir="auto"
                rows={4}
                value={singleText}
                disabled={isSubmitting}
                maxLength={SMS_MAX_TEXT_LENGTH + 100}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? errorId : undefined}
                placeholder="Paste the SMS text message to inspect..."
                onChange={(event) => {
                  setSingleText(event.currentTarget.value);
                  if (fieldError) setFieldError("");
                }}
                className={`min-h-28 w-full rounded-xl border bg-canvas px-3.5 py-2.5 text-base leading-6 text-foreground placeholder:text-muted-foreground focus:border-accent disabled:opacity-60 ${
                  fieldError ? "border-danger" : "border-border-control"
                }`}
              />
            </div>
          ) : batchFile ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  Batch file
                </span>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <Paperclip
                    aria-hidden="true"
                    className="size-4 shrink-0 text-accent"
                    strokeWidth={1.75}
                  />
                  <span
                    className="truncate font-mono font-medium text-foreground"
                    title={batchFile.name}
                  >
                    {batchFile.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    · {formatBytes(batchFile.size)}
                  </span>
                  <CopyButton
                    value={batchFile.name}
                    ariaLabel="Copy selected batch filename"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={openFilePicker}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-control bg-canvas px-4 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover active:bg-surface-selected disabled:cursor-default disabled:opacity-50"
                >
                  Change file
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={clearBatchFile}
                  aria-label="Remove selected batch file"
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-outline bg-canvas text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-50"
                >
                  <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor={batchInputId}
                className="block text-sm font-semibold text-foreground"
              >
                Batch messages (one per line)
              </label>
              <textarea
                id={batchInputId}
                dir="auto"
                rows={5}
                value={batchText}
                disabled={isSubmitting}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? errorId : undefined}
                placeholder={
                  "Paste one SMS message per line, or drop a .txt, .csv, .json, or .jsonl file here..."
                }
                onChange={(event) => {
                  setBatchText(event.currentTarget.value);
                  if (fieldError) setFieldError("");
                }}
                className={`min-h-32 w-full rounded-xl border bg-canvas px-3.5 py-2.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:border-accent disabled:opacity-60 ${
                  fieldError ? "border-danger" : "border-border-control"
                }`}
              />
            </div>
          )}
        </div>

        {/* Footer action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline px-5 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {mode === "batch" && !batchFile ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={openFilePicker}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-control bg-canvas px-4 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover active:bg-surface-selected disabled:cursor-default disabled:opacity-50"
              >
                Import file (.txt, .csv, .json, .jsonl)
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                {mode === "single"
                  ? "Supports English, Arabic, and multilingual SMS text."
                  : "Accepted batch files: .txt, .csv, .json, .jsonl up to 5 MiB."}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {((mode === "single" && singleText.length > 0) ||
              (mode === "batch" && !batchFile && batchText.length > 0)) && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (mode === "single") {
                    setSingleText("");
                  } else {
                    setBatchText("");
                  }
                  setFieldError("");
                  setErrorResponse(null);
                }}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-outline bg-canvas px-3.5 text-sm font-semibold text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-50"
              >
                Clear
              </button>
            )}

            <button
              id="features-sms-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-hover active:bg-primary-pressed disabled:cursor-default disabled:bg-surface-raised disabled:text-muted-foreground"
            >
              {isSubmitting
                ? "Scanning..."
                : mode === "batch"
                  ? "Scan batch"
                  : "Scan SMS"}
            </button>
          </div>
        </div>

        {fieldError && (
          <div className="border-t border-danger/35 bg-danger-bg/25 px-5 py-3 sm:px-6">
            <p id={errorId} role="alert" className="text-sm font-medium text-danger">
              {fieldError}
            </p>
          </div>
        )}

        {isSubmitting && (
          <div
            aria-busy="true"
            className="border-t border-outline bg-surface-raised/50 px-5 py-3 text-xs text-muted-foreground sm:px-6"
          >
            {mode === "batch"
              ? "Inspecting SMS batch messages, extracted links, callback numbers, and obfuscation signals statically..."
              : "Inspecting SMS text, extracted links, callback numbers, and obfuscation signals statically..."}
          </div>
        )}

        {errorResponse && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-danger/35 bg-danger-bg/25 px-5 py-3 text-sm sm:px-6"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-danger"
                strokeWidth={1.75}
              />
              <div className="min-w-0">
                <p className="font-medium text-foreground">{errorResponse.message}</p>
                <div className="flex flex-wrap items-center gap-1">
                  <p className="font-mono text-xs text-muted-foreground">
                    Ref: {errorResponse.diagnosticId}
                  </p>
                  <CopyButton
                    value={errorResponse.diagnosticId}
                    ariaLabel="Copy diagnostic reference ID"
                  />
                </div>
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
      </form>

      {outcome && !isSubmitting && (
        <ScanResultPanel outcome={outcome} onReset={handleReset} />
      )}
    </div>
  );
}
