"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import QRBlock from "@/components/QRBlock";
import CopyableLink from "@/components/CopyableLink";
import { getCampaign } from "@/lib/storage";
import type { Campaign } from "@/lib/types";

export default function CampaignDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setCampaign(getCampaign(slug));
    setOrigin(window.location.origin);
  }, [slug]);

  if (campaign === undefined) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-ink/50">Loading campaign…</div>
        <SiteFooter />
      </main>
    );
  }
  if (campaign === null) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="font-display font-black text-h3">Campaign not found</h1>
          <p className="mt-3 text-ink/60">We couldn&rsquo;t find a campaign with that slug.</p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-flex">Back to dashboard</Link>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const url = `${origin}/c/${campaign.slug}`;

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-6 pb-20">
        <Link href="/dashboard" className="btn-tertiary text-sm">← All campaigns</Link>
        <div className="mt-3 mb-10">
          <p className="font-display font-bold text-sm uppercase tracking-[0.18em] text-amber-pressed">
            {campaign.orgName}
          </p>
          <h1 className="mt-2 font-display font-black text-[32px] sm:text-[40px] md:text-h2 leading-tight break-words">
            {campaign.campaignName}
          </h1>
          {campaign.visionStatement && (
            <p className="mt-4 text-ink/70 max-w-3xl">{campaign.visionStatement}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="space-y-4">
            <div className="card p-7">
              <h3 className="font-display font-bold text-lg">Campaign link</h3>
              <p className="text-sm text-ink/60 mt-1">Share this URL with donors. It opens the branded landing + calculator.</p>
              <div className="mt-4">
                <CopyableLink value={url} />
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                <Link href={`/c/${campaign.slug}`} className="btn-secondary">Preview Landing →</Link>
                <Link href={`/c/${campaign.slug}/calculate`} className="btn-tertiary">Jump to calculator ↗</Link>
              </div>
            </div>

            <div className="card p-7">
              <h3 className="font-display font-bold text-lg">Branding</h3>
              <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <Row k="Giving link" v={campaign.givingLink} mono />
                <Row k="Accent color" v={campaign.accentColor} swatch={campaign.accentColor} />
                <Row k="Kingdom Impact Mode" v={campaign.kingdomImpactMode ? "On" : "Off"} />
                <Row k="Custom logo" v={campaign.logoDataUrl ? "Uploaded" : "Default (One Day Calculator)"} />
              </dl>
              <p className="mt-5 text-xs text-ink/50">
                Want to change something? Re-run setup to spin up a new campaign — or edit in code at <code className="font-mono">lib/storage.ts</code>.
              </p>
            </div>

            <div className="card p-7">
              <h3 className="font-display font-bold text-lg">Impact categories</h3>
              {campaign.impacts.length === 0 ? (
                <p className="mt-3 text-ink/50 text-sm">No impacts selected.</p>
              ) : (
                <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {campaign.impacts.map((i) => (
                    <li key={i.id} className="rounded-2xl border border-muted-soft bg-cloud px-3 py-3">
                      <div className="text-xl">{i.emoji}</div>
                      <div className="mt-1 text-xs font-display font-bold">{i.title}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <QRBlock value={url} label="Scan to give" size={220} />
            <div className="card p-6 text-sm">
              <p className="font-display font-bold">Use this QR code on:</p>
              <ul className="mt-2 space-y-1 text-ink/70 list-disc list-inside">
                <li>Sunday slides &amp; lyric screens</li>
                <li>Bulletins, posters, postcards</li>
                <li>Email signatures &amp; socials</li>
                <li>Volunteer t-shirts &amp; lanyards</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Row({ k, v, mono, swatch }: { k: string; v: string; mono?: boolean; swatch?: string }) {
  return (
    <div>
      <dt className="text-ink/50 text-xs uppercase tracking-wide">{k}</dt>
      <dd className={`mt-1 ${mono ? "font-mono text-xs break-all" : "font-display font-bold"} flex items-center gap-2`}>
        {swatch && <span className="inline-block h-3 w-3 rounded-full" style={{ background: swatch }} />}
        {v}
      </dd>
    </div>
  );
}
