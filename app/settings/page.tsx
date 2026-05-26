"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { deleteCampaign, listCampaigns } from "@/lib/storage";
import type { Campaign } from "@/lib/types";

export default function SettingsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    setCampaigns(listCampaigns());
  }, []);

  function refresh() {
    setCampaigns(listCampaigns());
  }

  function resetAll() {
    if (!confirm("Remove all locally-saved campaigns? This restores the demo data.")) return;
    try {
      window.localStorage.removeItem("odo.campaigns.v1");
    } catch {}
    refresh();
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pt-6 pb-20">
        <p className="font-display font-bold text-sm uppercase tracking-[0.18em] text-amber-pressed">Settings</p>
        <h1 className="mt-2 font-display font-black text-h2 leading-tight">Customization</h1>
        <p className="mt-3 text-ink/60">Prototype settings — these control local demo data only.</p>

        <div className="mt-8 space-y-4">
          <div className="card p-7">
            <h2 className="font-display font-bold text-xl">Local campaigns</h2>
            <p className="mt-2 text-sm text-ink/60">
              Campaigns you create are stored in your browser&rsquo;s localStorage. They&rsquo;re not synced to any server.
            </p>
            {campaigns === null ? (
              <p className="mt-4 text-ink/40">Loading…</p>
            ) : campaigns.length === 0 ? (
              <p className="mt-4 text-ink/40">No campaigns stored.</p>
            ) : (
              <ul className="mt-4 divide-y divide-muted-soft">
                {campaigns.map((c) => (
                  <li key={c.slug} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-display font-bold">{c.campaignName}</p>
                      <p className="text-ink/50 text-xs">{c.orgName} · /c/{c.slug}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/dashboard/${c.slug}`} className="btn-tertiary text-sm">Open</Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${c.campaignName}"?`)) {
                            deleteCampaign(c.slug);
                            refresh();
                          }
                        }}
                        className="text-coral text-sm font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={resetAll} type="button" className="btn-secondary mt-5">
              Reset to demo data
            </button>
          </div>

          <div className="card p-7">
            <h2 className="font-display font-bold text-xl">Brand defaults</h2>
            <p className="mt-2 text-sm text-ink/60">
              These come from the Convoy of Hope Brand Guidelines and apply globally.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <BrandRow k="Primary accent" v="#FBBF24" />
              <BrandRow k="Surface" v="#F6F8FC" />
              <BrandRow k="Ink" v="#111B27" />
              <BrandRow k="Display font" v="Roboto Bold" />
              <BrandRow k="Body font" v="Inter" />
              <BrandRow k="Logo" v="One Day Calculator" />
            </dl>
            <p className="mt-4 text-xs text-ink/50">
              To change defaults, edit <code className="font-mono">tailwind.config.ts</code> and the logo in <code className="font-mono">/public/logo.png</code>.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function BrandRow({ k, v }: { k: string; v: string }) {
  const isColor = /^#/.test(v);
  return (
    <div>
      <dt className="text-ink/50 text-xs uppercase tracking-wide">{k}</dt>
      <dd className="mt-1 flex items-center gap-2 font-display font-bold">
        {isColor && <span className="inline-block h-3 w-3 rounded-full border border-ink/10" style={{ background: v }} />}
        {v}
      </dd>
    </div>
  );
}
