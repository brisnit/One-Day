import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { Campaign } from "@/lib/types";

const INDEX_KEY = "campaigns:index";
const slugKey = (slug: string) => `campaign:${slug}`;

function kvAvailable(): boolean {
  // @vercel/kv pulls from KV_REST_API_URL / KV_URL. If neither is set we
  // haven't connected a KV store yet and we should return 503 so the client
  // can transparently fall back to localStorage.
  return Boolean(process.env.KV_REST_API_URL || process.env.KV_URL);
}

// POST /api/campaigns  — create or update a campaign
export async function POST(req: Request) {
  if (!kvAvailable()) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }
  let body: Campaign;
  try {
    body = (await req.json()) as Campaign;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body.slug !== "string" || !body.slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  await kv.set(slugKey(body.slug), body);
  await kv.sadd(INDEX_KEY, body.slug);
  return NextResponse.json(body);
}

// GET /api/campaigns?slugs=a,b,c  — bulk fetch by slug list (used for the dashboard "my campaigns")
// GET /api/campaigns               — return everything in the index
export async function GET(req: Request) {
  if (!kvAvailable()) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const slugsParam = searchParams.get("slugs");

  let slugList: string[];
  if (slugsParam) {
    slugList = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    slugList = (await kv.smembers(INDEX_KEY)) as string[];
  }
  if (slugList.length === 0) return NextResponse.json([]);

  const keys = slugList.map(slugKey);
  const campaigns = (await kv.mget<(Campaign | null)[]>(...keys)) ?? [];
  return NextResponse.json(campaigns.filter((c): c is Campaign => Boolean(c)));
}
