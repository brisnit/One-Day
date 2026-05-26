"use client";

import type { Campaign } from "./types";
import { DEMO_CAMPAIGNS, SAMPLE_CAMPAIGN } from "./mockData";

const KEY = "odo.campaigns.v1";

function readAll(): Campaign[] {
  if (typeof window === "undefined") return DEMO_CAMPAIGNS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEMO_CAMPAIGNS;
    const parsed = JSON.parse(raw) as Campaign[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_CAMPAIGNS;
  } catch {
    return DEMO_CAMPAIGNS;
  }
}

function writeAll(campaigns: Campaign[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(campaigns));
}

export function listCampaigns(): Campaign[] {
  return readAll();
}

export function getCampaign(slug: string): Campaign | null {
  const all = readAll();
  const found = all.find((c) => c.slug === slug);
  if (found) return found;
  // Fall back to demo campaigns
  return DEMO_CAMPAIGNS.find((c) => c.slug === slug) ?? null;
}

export function saveCampaign(campaign: Campaign): Campaign {
  const all = readAll();
  const idx = all.findIndex((c) => c.slug === campaign.slug);
  if (idx === -1) {
    all.unshift(campaign);
  } else {
    all[idx] = campaign;
  }
  writeAll(all);
  return campaign;
}

export function deleteCampaign(slug: string) {
  const all = readAll().filter((c) => c.slug !== slug);
  writeAll(all);
}

export function ensureUniqueSlug(slug: string): string {
  const all = readAll();
  if (!all.some((c) => c.slug === slug)) return slug;
  let i = 2;
  while (all.some((c) => c.slug === `${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export { SAMPLE_CAMPAIGN };
