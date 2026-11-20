import { connection } from "next/server";
import { fetchGatewayHealth } from "@/lib/features/server/gateway-client";
import type { FeatureSlug } from "@/lib/features/types";
import { FeatureHubDirectory } from "./feature-hub-cards";
import { FeatureReadinessClient } from "./feature-readiness-client";
import { ReadinessBadge } from "./readiness-badge";

export async function HubReadinessStream() {
  await connection();
  const snapshot = await fetchGatewayHealth();
  return <FeatureHubDirectory initialSnapshot={snapshot} />;
}

export async function SingleFeatureReadinessStream({
  slug,
}: {
  slug: FeatureSlug;
}) {
  await connection();
  const snapshot = await fetchGatewayHealth();
  return <FeatureReadinessClient slug={slug} initialSnapshot={snapshot} />;
}

export function SingleFeatureReadinessFallback() {
  return <ReadinessBadge status="checking" />;
}
