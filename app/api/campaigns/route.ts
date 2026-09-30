import { NextResponse } from "next/server";
import { db, dbAvailable, keys } from "@/lib/db";
import { currentAccountId } from "@/lib/auth";
import type { Campaign } from "@/lib/types";

// Logos are stored inline as data URLs. The wizard downscales uploads well
// under this, but cap it server-side so one huge image can't slow every
// donor page load for that campaign.
const MAX_LOGO_CHARS = 1_000_000;

export const dynamic = "force-dynamic";

// POST /api/campaigns — create or update a campaign the signed-in account owns
export async function POST(req: Request) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const me = await currentAccountId();
  if (!me) return NextResponse.json({ error: "Sign in to save a campaign." }, { status: 401 });

  let body: Campaign;
  try {
    body = (await req.json()) as Campaign;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json({ error: "Missing or invalid slug" }, { status: 400 });
  }
  if (body.logoDataUrl && body.logoDataUrl.length > MAX_LOGO_CHARS) {
    return NextResponse.json(
      { error: "Logo image is too large. Please upload a smaller file." },
      { status: 413 }
    );
  }

  const existing = await db.get<Campaign>(keys.campaign(body.slug));
  if (existing && existing.ownerId !== me) {
    return NextResponse.json(
      { error: "You don't have permission to edit this campaign." },
      { status: 403 }
    );
  }

  const campaign: Campaign = {
    ...body,
    ownerId: me,
    createdAt: existing?.createdAt ?? body.createdAt ?? Date.now(),
  };
  await db.set(keys.campaign(campaign.slug), campaign);
  await db.sadd(keys.campaignIndex, campaign.slug);
  await db.sadd(keys.accountCampaigns(me), campaign.slug);
  return NextResponse.json(campaign);
}

// GET /api/campaigns — campaigns owned by the signed-in account
export async function GET() {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const me = await currentAccountId();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const slugs = await db.smembers(keys.accountCampaigns(me));
  const campaigns = await db.mget<Campaign>(slugs.map(keys.campaign));
  return NextResponse.json(
    campaigns
      .filter((c): c is Campaign => Boolean(c) && c!.ownerId === me)
      .sort((a, b) => b.createdAt - a.createdAt)
  );
}
