import { connection } from "next/server";
import { fetchGatewayHealth } from "@/lib/features/server/gateway-client";
import { privateJsonResponse } from "@/lib/features/server/route-helpers";

export async function GET() {
  await connection();
  const snapshot = await fetchGatewayHealth();
  return privateJsonResponse(snapshot, { status: 200 });
}
