import type { Metadata } from "next";
import { Suspense } from "react";
import { FeatureHubSkeleton } from "@/components/features/feature-hub-cards";
import { HubReadinessStream } from "@/components/features/readiness-stream";

export const metadata: Metadata = {
  title: "Security Scanners — Vanguard AV",
  description:
    "Choose a Vanguard AV static security scanner for emails, SMS messages, Office documents, PDFs, or Windows executables.",
};

export default function FeaturesHubPage() {
  return (
    <div className="w-full space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-[1.75rem] leading-[2.125rem] font-bold tracking-[-0.02em] text-foreground sm:text-[2rem] sm:leading-[2.5rem]">
          Security Scanners
        </h1>
        <p className="max-w-[65ch] text-base leading-6 text-muted-foreground">
          Choose a static inspection tool. Submissions are analyzed without executing files or
          opening links, and results are never stored.
        </p>
      </header>

      <Suspense fallback={<FeatureHubSkeleton />}>
        <HubReadinessStream />
      </Suspense>
    </div>
  );
}
