import { NextResponse } from "next/server";
import { dbAvailable } from "@/lib/db";
import { getAccount, startSession, verifyPassword } from "@/lib/auth";

// POST /api/auth/login  { email, password }
export async function POST(req: Request) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const account = await getAccount(email);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return NextResponse.json({ error: "That email and password don't match." }, { status: 401 });
  }
  await startSession(account.id);
  return NextResponse.json({ id: account.id });
}
