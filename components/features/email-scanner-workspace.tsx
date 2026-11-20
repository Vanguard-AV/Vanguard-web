"use client";

import { AlertCircle, Paperclip, RefreshCw, X } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { formatBytes, getFeatureDefinition } from "@/lib/features/catalog";
import type {
  ExecutionState,
  ScanApiResponse,
  ScanErrorResponse,
  ScanOutcome,
} from "@/lib/features/types";
import { CopyButton } from "./copy-button";
import { ScanResultPanel } from "./scan-result-panel";

export function EmailScannerWorkspace() {
  const feature = getFeatureDefinition("email");
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [execState, setExecState] = useState<ExecutionState>("idle");
  const [fieldError, setFieldError] = useState<string>("");
  const [errorResponse, setErrorResponse] = useState<ScanErrorResponse | null>(
    null,
  );
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [liveStatus, setLiveStatus] = useState("");

  const isSubmitting = execState === "submitting";

  function selectFile(next: File | null) {
    setFile(next);
    setFieldError("");
    setErrorResponse(null);
    if (next) {
      setLiveStatus(`Selected ${next.name} (${formatBytes(next.size)}).`);
    }
  }

  function openPicker() {
    if (isSubmitting) return;
    inputRef.current?.click();
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFile(null);
    setFieldError("");
    setErrorResponse(null);
    setLiveStatus("Removed selected email file.");
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
      selectFile(dropped);
    }
  }

  async function runScan() {
    if (submittingRef.current) return;

    if (!file) {
      setFieldError("Select a raw .eml file to inspect.");
      setErrorResponse(null);
      setExecState("idle");
      setLiveStatus("Select a raw .eml file before starting the scan.");
      return;
    }

    if (file.size === 0) {
      setFieldError("The selected .eml file is empty (0 bytes). Choose a non-empty message.");
      setErrorResponse(null);
      setExecState("idle");
      setLiveStatus("Selected file is empty.");
      return;
    }

    if (
      feature.maxFileSizeBytes !== null &&
      file.size > feature.maxFileSizeBytes
    ) {
      setFieldError(`This file exceeds the ${feature.limitLabel} limit.`);
      setErrorResponse(null);
      setExecState("idle");
      setLiveStatus(`Selected file exceeds the ${feature.limitLabel} limit.`);
      return;
    }

    submittingRef.current = true;
    setFieldError("");
    setErrorResponse(null);
    setExecState("submitting");
    setLiveStatus(`Scanning ${file.name} statically. Please wait...`);

    const formData = new FormData();
    formData.append("file", file);

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
                message: "Could not complete this email scan. Please try again.",
                retryable: true,
                diagnosticId: "client-fallback",
              };
        setErrorResponse(err);
        if (err.fieldErrors?.file) {
          setFieldError(err.fieldErrors.file);
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
          "Network connection was interrupted before the scan finished. Your selected .eml file is preserved — try again.",
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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFile(null);
    setOutcome(null);
    setErrorResponse(null);
    setFieldError("");
    setExecState("idle");
    setLiveStatus("Cleared scan result. Ready for another .eml file.");
  }

  return (
    <div className="space-y-6">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </p>

      <form
        id="features-email-workbench"
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
          ref={inputRef}
          id={inputId}
          type="file"
          accept={feature.acceptedExtensions.join(",")}
          disabled={isSubmitting}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? `${helpId} ${errorId}` : helpId}
          className="sr-only"
          onChange={(event) => {
            const chosen = event.currentTarget.files?.[0] ?? null;
            selectFile(chosen);
          }}
        />

        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1 space-y-1">
            <label
              htmlFor={inputId}
              className="block cursor-pointer text-sm font-semibold text-foreground"
            >
              Raw email message (.eml)
            </label>

            {file ? (
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Paperclip
                  aria-hidden="true"
                  className="size-4 shrink-0 text-accent"
                  strokeWidth={1.75}
                />
                <span
                  className="truncate font-mono font-medium text-foreground"
                  title={file.name}
                >
                  {file.name}
                </span>
                <span
                  id={helpId}
                  className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
                >
                  · {formatBytes(file.size)}
                </span>
                <CopyButton
                  value={file.name}
                  ariaLabel="Copy selected filename"
                />
              </div>
            ) : (
              <p id={helpId} className="text-sm text-muted-foreground">
                Drop a raw <span className="font-mono text-foreground/90">.eml</span> file
                here or choose one from your device.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={openPicker}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-control bg-canvas px-4 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover active:bg-surface-selected disabled:cursor-default disabled:opacity-50"
            >
              {file ? "Change file" : "Choose .eml file"}
            </button>

            {file && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={clearFile}
                aria-label="Remove selected file"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-outline bg-canvas text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-50"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </button>
            )}

            <button
              id="features-email-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary motion-safe:transition-colors motion-safe:duration-150 hover:bg-primary-hover active:bg-primary-pressed disabled:cursor-default disabled:bg-surface-raised disabled:text-muted-foreground"
            >
              {isSubmitting ? "Scanning..." : "Scan email"}
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
            Inspecting MIME headers, body text, inert links, and attachment metadata
            statically...
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
