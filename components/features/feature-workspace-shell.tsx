import type { ReactNode } from "react";
import { getFeatureDefinition } from "@/lib/features/catalog";
import type { FeatureSlug } from "@/lib/features/types";

interface FeatureWorkspaceShellProps {
  slug: FeatureSlug;
  readinessSlot: ReactNode;
  children: ReactNode;
}

export function FeatureWorkspaceShell({
  slug,
  readinessSlot,
  children,
}: FeatureWorkspaceShellProps) {
  const feature = getFeatureDefinition(slug);

  return (
    <div className="w-full space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[1.75rem] leading-[2.125rem] font-bold tracking-[-0.02em] text-foreground sm:text-[2rem] sm:leading-[2.5rem]">
            {feature.name}
          </h1>

          <div className="shrink-0">{readinessSlot}</div>
        </div>

        <p className="max-w-[65ch] text-base leading-6 text-muted-foreground">
          {feature.summary}
        </p>

        <p className="max-w-[75ch] text-xs leading-5 text-muted-foreground">
          <span className="font-mono text-foreground/90">{feature.formatLabel}</span> ·{" "}
          <span className="tabular-nums">{feature.limitLabel}</span> ·{" "}
          <span>{feature.staticSafetyNote}</span>
        </p>
      </header>

      {children}
    </div>
  );
}
