import { createClient } from "@vercel/kv";

// Minimal key/value surface the app needs. Backed by Upstash Redis (Vercel KV)
// in production. In local dev without KV_* env vars it falls back to an
// in-memory store so login + campaign editing can be exercised end-to-end.
export interface Db {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  sadd(key: string, member: string): Promise<void>;
  srem(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
}

// ONEDAY_NEW_* is the database restored from the archived store in Sept 2026.
// The original KV_* vars point at the archived (dead) host; kept only as a fallback.
const url = process.env.ONEDAY_NEW_KV_REST_API_URL || process.env.KV_REST_API_URL;
const token = process.env.ONEDAY_NEW_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

export function dbAvailable(): boolean {
  return Boolean(url && token) || process.env.NODE_ENV !== "production";
}

function redisDb(): Db {
  const kv = createClient({
    url: url!,
    token: token!,
    // Upstash defaults to 5 retries with exponential backoff (~4.5s total)
    // on network errors. Fail fast instead so pages never hang.
    retry: { retries: 1, backoff: () => 100 },
  });
  return {
    get: (k) => kv.get(k),
    set: async (k, v, o) => {
      if (o?.ex) await kv.set(k, v, { ex: o.ex });
      else await kv.set(k, v);
    },
    del: async (k) => {
      await kv.del(k);
    },
    mget: async <T,>(keys: string[]) =>
      keys.length ? ((await kv.mget<(T | null)[]>(...keys)) ?? []) : [],
    sadd: async (k, m) => {
      await kv.sadd(k, m);
    },
    srem: async (k, m) => {
      await kv.srem(k, m);
    },
    smembers: async (k) => (await kv.smembers(k)) as string[],
  };
}

function memoryDb(): Db {
  const g = globalThis as unknown as { __odoMem?: Map<string, { v: unknown; exp?: number }> };
  const mem = (g.__odoMem ??= new Map());
  const read = (k: string) => {
    const e = mem.get(k);
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) {
      mem.delete(k);
      return null;
    }
    return e.v;
  };
  const clone = <T,>(v: unknown) => (v == null ? null : (JSON.parse(JSON.stringify(v)) as T));
  return {
    get: async (k) => clone(read(k)),
    set: async (k, v, o) => {
      mem.set(k, { v, exp: o?.ex ? Date.now() + o.ex * 1000 : undefined });
    },
    del: async (k) => {
      mem.delete(k);
    },
    mget: async (keys) => keys.map((k) => clone(read(k))),
    sadd: async (k, m) => {
      const s = new Set((read(k) as string[]) ?? []);
      s.add(m);
      mem.set(k, { v: [...s] });
    },
    srem: async (k, m) => {
      mem.set(k, { v: ((read(k) as string[]) ?? []).filter((x) => x !== m) });
    },
    smembers: async (k) => [...((read(k) as string[]) ?? [])],
  };
}

export const db: Db = url && token ? redisDb() : memoryDb();

// ─── Keys ──────────────────────────────────────────────────────────────────
export const keys = {
  campaign: (slug: string) => `campaign:${slug}`,
  campaignIndex: "campaigns:index",
  account: (id: string) => `account:${id}`,
  accountCampaigns: (id: string) => `account:${id}:campaigns`,
  session: (token: string) => `session:${token}`,
};
