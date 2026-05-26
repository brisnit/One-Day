"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { listCampaigns } from "@/lib/storage";
import type { Campaign } from "@/lib/types";

export default function DashboardIndexPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    setCampaigns(listCampaigns());
  }, []);

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-display font-bold text-sm uppercase tracking-[0.18em] text-amber-pressed">
              Campaign Dashboard
            </p>
            <h1 className="mt-2 font-display font-black text-h2 leading-tight">
              Your campaigns
            </h1>
          </div>
          <Link href="/start" className="btn-primary">+ New Campaign</Link>
        </div>

        {campaigns === null ? (
          <div className="card p-8 text-ink/50">Loading…</div>
        ) : campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <li key={c.slug}>
                <Link href={`/dashboard/${c.slug}`} className="card p-7 block hover:shadow-glow transition">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{c.orgName}</p>
                  <h3 className="mt-1 font-display font-bold text-xl">{c.campaignName}</h3>
                  <p className="mt-3 text-sm text-ink/60 line-clamp-2">{c.visionStatement || "No vision statement yet."}</p>
                  <div className="mt-5 flex items-center justify-between text-xs">
                    <span className="font-mono text-ink/50">/c/{c.slug}</span>
                    <span className="inline-flex items-center gap-1 font-display font-bold text-ink">
                      Open →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <p className="text-2xl">✨</p>
      <h2 className="mt-2 font-display font-bold text-xl">No campaigns yet</h2>
      <p className="mt-2 text-ink/60">Build your first One Day Offering campaign in a few minutes.</p>
      <Link href="/start" className="btn-primary mt-6 inline-flex">Start a Campaign →</Link>
    </div>
  );
}
