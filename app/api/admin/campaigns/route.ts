import { NextResponse } from "next/server";
import { db, dbAvailable, keys } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/admin/campaigns  (header: x-admin-secret)
// Lightweight list of every campaign (no logos) so the admin can see which
// churches exist and who owns them.
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const slugs = await db.smembers(keys.campaignIndex);
  const summaries: object[] = [];
  // Fetch one at a time so large inline logos don't blow the response limit.
  for (const slug of slugs) {
    const c = await db.get<Campaign>(keys.campaign(slug));
    if (!c) continue;
    summaries.push({
      slug: c.slug,
      orgName: c.orgName,
      campaignName: c.campaignName,
      ownerId: c.ownerId ?? null,
      createdAt: new Date(c.createdAt).toISOString(),
      logoKB: Math.round((c.logoDataUrl?.length ?? 0) / 1024),
    });
  }
  return NextResponse.json(summaries);
}
