"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

interface AdvancedOptionsPanelProps {
  summary?: string;
  children: ReactNode;
}

export function AdvancedOptionsPanel({
  summary = "Optional threshold and inspection controls",
  children,
}: AdvancedOptionsPanelProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-t border-outline pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 text-start motion-safe:transition-colors motion-safe:duration-150 hover:bg-surface-hover"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Advanced analysis options
          </span>
          <span className="block text-xs text-muted-foreground">{summary}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-150 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>

      <div id={contentId} hidden={!open} className="pt-4">
        {children}
      </div>
    </div>
  );
}
