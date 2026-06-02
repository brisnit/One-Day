import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { Campaign } from "@/lib/types";

const INDEX_KEY = "campaigns:index";
const slugKey = (slug: string) => `campaign:${slug}`;

function kvAvailable(): boolean {
  return Boolean(process.env.KV_REST_API_URL || process.env.KV_URL);
}

// GET /api/campaigns/:slug  — read one campaign
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  if (!kvAvailable()) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }
  const campaign = await kv.get<Campaign>(slugKey(params.slug));
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(campaign);
}

// DELETE /api/campaigns/:slug
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  if (!kvAvailable()) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }
  await kv.del(slugKey(params.slug));
  await kv.srem(INDEX_KEY, params.slug);
  return new NextResponse(null, { status: 204 });
}
