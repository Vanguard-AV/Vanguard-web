import type { Metadata } from "next";
import { Suspense } from "react";
import { FeatureWorkspaceShell } from "@/components/features/feature-workspace-shell";
import { FileScannerWorkspace } from "@/components/features/file-scanner-workspace";
import {
  SingleFeatureReadinessFallback,
  SingleFeatureReadinessStream,
} from "@/components/features/readiness-stream";

export const metadata: Metadata = {
  title: "Office Document Scanner — Vanguard AV",
  description:
    "Statically inspect Microsoft Office and RTF documents with explicit coverage transparency and 9-family threat attribution.",
};

export default function OfficeFeaturePage() {
  return (
    <FeatureWorkspaceShell
      slug="office"
      readinessSlot={
        <Suspense fallback={<SingleFeatureReadinessFallback />}>
          <SingleFeatureReadinessStream slug="office" />
        </Suspense>
      }
    >
      <FileScannerWorkspace slug="office" />
    </FeatureWorkspaceShell>
  );
}
