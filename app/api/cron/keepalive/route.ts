import { NextResponse } from "next/server";
import { db, dbAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/cron/keepalive — run daily by Vercel Cron (see vercel.json).
// Upstash archives free databases after a stretch of inactivity, which took
// every campaign offline in July 2026. A daily write keeps it active.
export async function GET() {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  await db.set("keepalive", Date.now());
  return NextResponse.json({ ok: true });
}
