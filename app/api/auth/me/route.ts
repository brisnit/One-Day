import { NextResponse } from "next/server";
import { currentAccountId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me  → { id } or 401
export async function GET() {
  const id = await currentAccountId().catch(() => null);
  if (!id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ id });
}
