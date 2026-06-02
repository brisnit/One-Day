import { NextResponse } from "next/server";

// Temporary diagnostic: lists env var NAMES (not values) that look like they
// belong to a storage integration. Safe to call publicly — never returns the
// actual token values, just whether they exist.
//
// REMOVE this file once KV is wired up correctly.
export async function GET() {
  const interesting = Object.keys(process.env)
    .filter((k) =>
      /^(KV|UPSTASH|REDIS|VERCEL_KV|STORAGE)_/.test(k) || /_(URL|TOKEN)$/.test(k)
    )
    .sort();

  return NextResponse.json({
    region: process.env.VERCEL_REGION ?? null,
    deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
    detectedStorageEnvVars: interesting,
    expectedByCode: [
      "KV_URL",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
      "KV_REST_API_READ_ONLY_TOKEN",
    ],
    allMatch: ["KV_URL", "KV_REST_API_URL", "KV_REST_API_TOKEN"].every(
      (k) => process.env[k]
    ),
  });
}
