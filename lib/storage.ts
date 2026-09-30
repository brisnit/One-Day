"use client";

import type { Campaign } from "./types";
import { DEMO_CAMPAIGNS, SAMPLE_CAMPAIGN } from "./mockData";

// Pre-login builds kept whole campaigns in localStorage when the server was
// unavailable. Still read as a last-resort fallback so those links keep
// working on the device that created them.
const LEGACY_FULL_KEY = "odo.campaigns.v1";
const CACHE_PREFIX = "odo.campaign.";

function readLegacyAll(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_FULL_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Campaign[]) : [];
  } catch {
    return [];
  }
}

// ─── Campaign cache ────────────────────────────────────────────────────────
// Donors move landing → calculate → results → share, and every page needs the
// campaign. Cache it (memory + sessionStorage) so only the first page fetches.

const memCache = new Map<string, Campaign>();
const inflight = new Map<string, Promise<Campaign | null>>();

function readCache(slug: string): Campaign | null {
  const hit = memCache.get(slug);
  if (hit) return hit;
  try {
    const raw = window.sessionStorage.getItem(CACHE_PREFIX + slug);
    if (raw) {
      const c = JSON.parse(raw) as Campaign;
      memCache.set(slug, c);
      return c;
    }
  } catch {}
  return null;
}

function writeCache(c: Campaign) {
  memCache.set(c.slug, c);
  try {
    window.sessionStorage.setItem(CACHE_PREFIX + c.slug, JSON.stringify(c));
  } catch {}
}

function dropCache(slug: string) {
  memCache.delete(slug);
  try {
    window.sessionStorage.removeItem(CACHE_PREFIX + slug);
  } catch {}
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<{ status: number; data: T | null }> {
  try {
    const res = await fetch(input, init);
    const data = res.status === 204 ? null : ((await res.json().catch(() => null)) as T | null);
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

function errorMessage(data: unknown, fallback: string): string {
  const msg = (data as { error?: string } | null)?.error;
  return typeof msg === "string" ? msg : fallback;
}

// ─── Campaigns ─────────────────────────────────────────────────────────────

export async function getCampaign(slug: string): Promise<Campaign | null> {
  const demo = DEMO_CAMPAIGNS.find((c) => c.slug === slug);
  if (demo) return demo;

  const cached = readCache(slug);
  if (cached) return cached;

  let pending = inflight.get(slug);
  if (!pending) {
    pending = (async () => {
      const { status, data } = await fetchJson<Campaign>(`/api/campaigns/${encodeURIComponent(slug)}`);
      if (status === 200 && data) {
        writeCache(data);
        return data;
      }
      return readLegacyAll().find((c) => c.slug === slug) ?? null;
    })();
    inflight.set(slug, pending);
    pending.finally(() => inflight.delete(slug));
  }
  return pending;
}

/** Uncached read for the owner dashboard. `canEdit` is true for the signed-in owner. */
export async function getCampaignForOwner(
  slug: string
): Promise<(Campaign & { canEdit: boolean }) | null> {
  const demo = DEMO_CAMPAIGNS.find((c) => c.slug === slug);
  if (demo) return { ...demo, canEdit: false };
  const { status, data } = await fetchJson<Campaign & { canEdit: boolean }>(
    `/api/campaigns/${encodeURIComponent(slug)}?fresh=1`,
    { cache: "no-store" }
  );
  return status === 200 ? data : null;
}

/** Campaigns owned by the signed-in account, or null when signed out. */
export async function listCampaigns(): Promise<Campaign[] | null> {
  const { status, data } = await fetchJson<Campaign[]>(`/api/campaigns`, { cache: "no-store" });
  if (status === 401) return null;
  return data ?? [];
}

export async function saveCampaign(campaign: Campaign): Promise<Campaign> {
  const { status, data } = await fetchJson<Campaign>(`/api/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
  });
  if (status !== 200 || !data) {
    throw new Error(errorMessage(data, "Couldn't save campaign. Please try again."));
  }
  writeCache(data);
  return data;
}

export async function deleteCampaign(slug: string): Promise<void> {
  const { status, data } = await fetchJson(`/api/campaigns/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (status !== 204 && status !== 200) {
    throw new Error(errorMessage(data, "Couldn't delete campaign."));
  }
  dropCache(slug);
}

export async function ensureUniqueSlug(slug: string): Promise<string> {
  const taken = async (s: string) =>
    DEMO_CAMPAIGNS.some((c) => c.slug === s) ||
    (await fetchJson(`/api/campaigns/${encodeURIComponent(s)}?fresh=1`, { cache: "no-store" }))
      .status === 200;
  if (!(await taken(slug))) return slug;
  for (let i = 2; i < 100; i++) {
    const candidate = `${slug}-${i}`;
    if (!(await taken(candidate))) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function getMe(): Promise<string | null> {
  const { status, data } = await fetchJson<{ id: string }>(`/api/auth/me`, { cache: "no-store" });
  return status === 200 && data ? data.id : null;
}

async function authPost(path: string, email: string, password: string): Promise<string> {
  const { status, data } = await fetchJson<{ id: string }>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (status !== 200 || !data) {
    throw new Error(errorMessage(data, "Something went wrong. Please try again."));
  }
  return data.id;
}

export const signIn = (email: string, password: string) => authPost("/api/auth/login", email, password);
export const signUp = (email: string, password: string) => authPost("/api/auth/signup", email, password);

export async function signOut(): Promise<void> {
  await fetchJson(`/api/auth/logout`, { method: "POST" });
}

export { SAMPLE_CAMPAIGN };
