import type { Metadata } from "next";
import { Suspense } from "react";
import { FeatureWorkspaceShell } from "@/components/features/feature-workspace-shell";
import {
  SingleFeatureReadinessFallback,
  SingleFeatureReadinessStream,
} from "@/components/features/readiness-stream";
import { SmsScannerWorkspace } from "@/components/features/sms-scanner-workspace";

export const metadata: Metadata = {
  title: "SMS Spam & Smishing Scanner — Vanguard AV",
  description:
    "Analyze single or batch multilingual SMS messages offline for spam, smishing links, and obfuscation.",
};

export default function SmsFeaturePage() {
  return (
    <FeatureWorkspaceShell
      slug="sms"
      readinessSlot={
        <Suspense fallback={<SingleFeatureReadinessFallback />}>
          <SingleFeatureReadinessStream slug="sms" />
        </Suspense>
      }
    >
      <SmsScannerWorkspace />
    </FeatureWorkspaceShell>
  );
}
