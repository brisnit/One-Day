"use client";

import type { Campaign } from "./types";
import { DEMO_CAMPAIGNS, SAMPLE_CAMPAIGN } from "./mockData";

// localStorage keys
// - MY_SLUGS_KEY: which campaign slugs THIS browser created (so /dashboard
//   shows the user's own campaigns rather than every campaign ever created).
// - LEGACY_FULL_KEY: pre-KV storage where the entire campaign objects lived
//   client-side. We still read it as a fallback when the server is unavailable
//   so the app keeps working in dev / before KV is connected.
const MY_SLUGS_KEY = "odo.mycampaigns.v1";
const LEGACY_FULL_KEY = "odo.campaigns.v1";

// ─── localStorage helpers ─────────────────────────────────────────────────

function readMySlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MY_SLUGS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeMySlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MY_SLUGS_KEY, JSON.stringify(slugs));
}

function rememberMySlug(slug: string) {
  const slugs = readMySlugs();
  if (!slugs.includes(slug)) {
    slugs.unshift(slug);
    writeMySlugs(slugs);
  }
}

function forgetMySlug(slug: string) {
  writeMySlugs(readMySlugs().filter((s) => s !== slug));
}

function readLegacyAll(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_FULL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Campaign[]) : [];
  } catch {
    return [];
  }
}

function writeLegacyAll(campaigns: Campaign[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEGACY_FULL_KEY, JSON.stringify(campaigns));
}

// ─── safeFetch: never throws, treats 5xx/404 as "no data" ──────────────────

async function safeFetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function safeFetchOk(input: RequestInfo, init?: RequestInit): Promise<boolean> {
  try {
    const res = await fetch(input, init);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getCampaign(slug: string): Promise<Campaign | null> {
  // Hard-coded demos are always available client-side.
  const demo = DEMO_CAMPAIGNS.find((c) => c.slug === slug);
  if (demo) return demo;

  // Try server (KV). Returns null on 404 or if KV isn't configured.
  const fromServer = await safeFetchJson<Campaign>(
    `/api/campaigns/${encodeURIComponent(slug)}`
  );
  if (fromServer) return fromServer;

  // Fallback for offline / KV-not-configured: legacy localStorage.
  const local = readLegacyAll().find((c) => c.slug === slug);
  return local ?? null;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const mySlugs = readMySlugs();
  const localCampaigns = readLegacyAll();

  // Nothing tracked yet: show demos plus anything left in legacy localStorage.
  if (mySlugs.length === 0) {
    return localCampaigns.length > 0
      ? [...localCampaigns, ...DEMO_CAMPAIGNS]
      : DEMO_CAMPAIGNS;
  }

  // We have a list of slugs the user created. Try the server first.
  const fromServer = await safeFetchJson<Campaign[]>(
    `/api/campaigns?slugs=${mySlugs.map(encodeURIComponent).join(",")}`
  );

  if (fromServer) {
    // Server responded — even if empty, treat as authoritative for these slugs.
    return [...fromServer, ...DEMO_CAMPAIGNS];
  }

  // Server unavailable — fall back to whatever's in legacy storage.
  return localCampaigns.length > 0
    ? [...localCampaigns, ...DEMO_CAMPAIGNS]
    : DEMO_CAMPAIGNS;
}

export async function saveCampaign(campaign: Campaign): Promise<Campaign> {
  // Always remember the slug locally so /dashboard knows it's "mine".
  rememberMySlug(campaign.slug);

  const saved = await safeFetchJson<Campaign>(`/api/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaign),
  });

  if (saved) return saved;

  // Server unavailable — write to legacy localStorage as a fallback so the
  // wizard still completes successfully in dev / before KV is connected.
  const all = readLegacyAll();
  const idx = all.findIndex((c) => c.slug === campaign.slug);
  if (idx === -1) all.unshift(campaign);
  else all[idx] = campaign;
  writeLegacyAll(all);
  return campaign;
}

export async function deleteCampaign(slug: string): Promise<void> {
  await safeFetchOk(`/api/campaigns/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  // Always tidy up local state.
  writeLegacyAll(readLegacyAll().filter((c) => c.slug !== slug));
  forgetMySlug(slug);
}

export async function ensureUniqueSlug(slug: string): Promise<string> {
  if (!(await getCampaign(slug))) return slug;
  let i = 2;
  // Loop until we find an unused slug. Caps at 100 to avoid pathological runs.
  while (i < 100) {
    const candidate = `${slug}-${i}`;
    if (!(await getCampaign(candidate))) return candidate;
    i++;
  }
  // Extremely unlikely escape hatch.
  return `${slug}-${Date.now().toString(36)}`;
}

export { SAMPLE_CAMPAIGN };
