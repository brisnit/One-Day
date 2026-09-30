import { NextResponse } from "next/server";
import { db, dbAvailable, keys } from "@/lib/db";
import { isAdmin, upsertAccount } from "@/lib/auth";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/admin/accounts  (header: x-admin-secret)
//   { id, password, slugs?: string[] }
// Creates the account (or resets its password) and transfers ownership of the
// listed campaigns to it. Used by tools/church_login.py for churches that
// launched before logins existed, and for password resets.
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { id, password, slugs = [] } = (await req.json().catch(() => ({}))) as {
    id?: string;
    password?: string;
    slugs?: string[];
  };
  if (!id || !password || password.length < 8) {
    return NextResponse.json({ error: "id and password (8+ chars) required" }, { status: 400 });
  }
  const account = await upsertAccount(id, password);

  const assigned: string[] = [];
  const missing: string[] = [];
  for (const slug of slugs) {
    const campaign = await db.get<Campaign>(keys.campaign(slug));
    if (!campaign) {
      missing.push(slug);
      continue;
    }
    if (campaign.ownerId && campaign.ownerId !== account.id) {
      await db.srem(keys.accountCampaigns(campaign.ownerId), slug);
    }
    await db.set(keys.campaign(slug), { ...campaign, ownerId: account.id });
    await db.sadd(keys.accountCampaigns(account.id), slug);
    assigned.push(slug);
  }
  return NextResponse.json({ id: account.id, assigned, missing });
}
