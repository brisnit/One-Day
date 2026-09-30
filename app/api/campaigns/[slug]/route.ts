import { NextResponse } from "next/server";
import { db, dbAvailable, keys } from "@/lib/db";
import { currentAccountId } from "@/lib/auth";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/campaigns/:slug — read one campaign (public)
//   ?fresh=1  bypasses the CDN cache and adds `canEdit` for the signed-in owner.
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const fresh = new URL(req.url).searchParams.has("fresh");
  const campaign = await db.get<Campaign>(keys.campaign(params.slug));
  if (!campaign) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { ownerId, ...publicCampaign } = campaign;
  if (fresh) {
    const me = await currentAccountId();
    return NextResponse.json(
      { ...publicCampaign, canEdit: Boolean(me && me === ownerId) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
  // Donor pages hit this on every visit. Let Vercel's edge cache serve it:
  // fresh for 10s, then served stale instantly while revalidating in the
  // background, so owner edits show up within seconds without donors waiting.
  return NextResponse.json(publicCampaign, {
    headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=86400" },
  });
}

// DELETE /api/campaigns/:slug — owner only
export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const me = await currentAccountId();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const campaign = await db.get<Campaign>(keys.campaign(params.slug));
  if (!campaign) return new NextResponse(null, { status: 204 });
  if (campaign.ownerId !== me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.del(keys.campaign(params.slug));
  await db.srem(keys.campaignIndex, params.slug);
  await db.srem(keys.accountCampaigns(me), params.slug);
  return new NextResponse(null, { status: 204 });
}
