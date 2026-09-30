import { NextResponse } from "next/server";
import { dbAvailable } from "@/lib/db";
import { getAccount, startSession, upsertAccount } from "@/lib/auth";

// POST /api/auth/signup  { email, password }
export async function POST(req: Request) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (await getAccount(email)) {
    return NextResponse.json(
      { error: "An account with that email already exists. Sign in instead." },
      { status: 409 }
    );
  }
  const account = await upsertAccount(email, password);
  await startSession(account.id);
  return NextResponse.json({ id: account.id });
}
