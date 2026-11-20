"use client";

import { FileUp, Paperclip, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { formatBytes } from "@/lib/features/catalog";

interface FileDropzoneProps {
  label: string;
  acceptedExtensions: readonly string[];
  formatLabel: string;
  limitLabel: string;
  file: File | null;
  disabled?: boolean;
  error?: string | null;
  onFileSelect: (file: File | null) => void;
}

export function FileDropzone({
  label,
  acceptedExtensions,
  formatLabel,
  limitLabel,
  file,
  disabled = false,
  error,
  onFileSelect,
}: FileDropzoneProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (dropped) {
      onFileSelect(dropped);
    }
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect(null);
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
        {label} <span className="text-danger" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed px-4 py-4 motion-safe:transition-colors motion-safe:duration-150 sm:px-5 ${
          error
            ? "border-danger bg-danger-bg/25"
            : dragging
              ? "border-accent bg-surface-selected/50"
              : "border-border-control bg-canvas hover:border-accent/60 hover:bg-surface-raised/60"
        } ${disabled ? "opacity-65" : ""}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptedExtensions.join(",")}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${helpId} ${errorId}` : helpId}
          className="sr-only"
          onChange={(event) => {
            const chosen = event.currentTarget.files?.[0] ?? null;
            onFileSelect(chosen);
          }}
        />

        {file ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Paperclip
                aria-hidden="true"
                className="size-4 shrink-0 text-accent"
                strokeWidth={1.75}
              />
              <div className="min-w-0">
                <p
                  className="truncate font-mono text-sm text-foreground"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatBytes(file.size)} · Ready to inspect statically
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={openPicker}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-control bg-surface px-3.5 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover disabled:cursor-default disabled:opacity-50"
              >
                Replace file
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={clearFile}
                aria-label="Remove selected file"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-outline bg-surface text-muted-foreground motion-safe:transition-colors motion-safe:duration-150 hover:border-border-control hover:bg-surface-hover hover:text-foreground disabled:cursor-default disabled:opacity-50"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileUp
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-accent"
                strokeWidth={1.75}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Drop a file here, or choose one from your device
                </p>
                <p id={helpId} className="text-xs text-muted-foreground">
                  Accepted:{" "}
                  <span className="font-mono text-foreground/90">
                    {formatLabel}
                  </span>{" "}
                  · <span>{limitLabel}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={openPicker}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border-control bg-surface px-4 text-sm font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover active:bg-surface-selected disabled:cursor-default disabled:opacity-50"
            >
              Choose file
            </button>
          </div>
        )}
      </div>

      {file && (
        <p id={helpId} className="text-xs text-muted-foreground">
          Accepted: <span className="font-mono">{formatLabel}</span> ·{" "}
          {limitLabel}. Actual file contents are verified before scanning.
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
