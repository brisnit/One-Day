import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db, keys } from "./db";

// Free, self-hosted auth: accounts + sessions live in the same KV store as
// campaigns. Passwords are hashed with scrypt (Node built-in). Sessions are
// random tokens stored server-side and referenced by an httpOnly cookie.

export const SESSION_COOKIE = "odo_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface Account {
  id: string; // normalized email or username
  passwordHash: string; // "scrypt$<salt hex>$<hash hex>"
  createdAt: number;
}

export function normalizeId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

export function getAccount(id: string) {
  return db.get<Account>(keys.account(normalizeId(id)));
}

export async function upsertAccount(id: string, password: string): Promise<Account> {
  const account: Account = {
    id: normalizeId(id),
    passwordHash: hashPassword(password),
    createdAt: (await getAccount(id))?.createdAt ?? Date.now(),
  };
  await db.set(keys.account(account.id), account);
  return account;
}

export async function startSession(accountId: string) {
  const token = randomBytes(32).toString("hex");
  await db.set(keys.session(token), accountId, { ex: SESSION_TTL_SECONDS });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await db.del(keys.session(token));
  cookies().delete(SESSION_COOKIE);
}

/** The signed-in account id, or null. */
export async function currentAccountId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return db.get<string>(keys.session(token));
}

export function isAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret) && req.headers.get("x-admin-secret") === secret;
}
