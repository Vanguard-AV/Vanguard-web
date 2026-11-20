import type { Metadata } from "next";
import { Suspense } from "react";
import { FeatureWorkspaceShell } from "@/components/features/feature-workspace-shell";
import {
  SingleFeatureReadinessFallback,
  SingleFeatureReadinessStream,
} from "@/components/features/readiness-stream";
import { UrlScannerWorkspace } from "@/components/features/url-scanner-workspace";

export const metadata: Metadata = {
  title: "URL Phishing & Malware Scanner — Vanguard AV",
  description:
    "Inspect single or batch HTTP(S) URLs and bare domains offline across a 5-branch fusion ensemble with WHATWG host/path parsing and 18 lexical features.",
};

export default function UrlFeaturePage() {
  return (
    <FeatureWorkspaceShell
      slug="url"
      readinessSlot={
        <Suspense fallback={<SingleFeatureReadinessFallback />}>
          <SingleFeatureReadinessStream slug="url" />
        </Suspense>
      }
    >
      <UrlScannerWorkspace />
    </FeatureWorkspaceShell>
  );
}
