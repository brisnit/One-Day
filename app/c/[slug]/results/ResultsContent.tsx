"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import ImpactGrid from "@/components/ImpactGrid";
import { getCampaign } from "@/lib/storage";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export default function ResultsPage() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCampaign(getCampaign(slug));
  }, [slug]);

  const amount = Number(params.get("amount") ?? 0);
  const annual = Number(params.get("annual") ?? 0);
  const workdays = Number(params.get("workdays") ?? 235);

  if (campaign === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  }
  if (campaign === null) {
    return <main className="min-h-screen flex items-center justify-center"><p>Campaign not found.</p></main>;
  }
  if (!amount || amount <= 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Logo size="md" />
        <h1 className="mt-6 font-display font-black text-h3">No result yet</h1>
        <p className="mt-3 text-ink/60">Run the calculator first to see your One Day Offering.</p>
        <Link href={`/c/${campaign.slug}/calculate`} className="btn-ink mt-6 inline-flex">
          Calculate My One Day Offering →
        </Link>
      </main>
    );
  }

  const accent = campaign.accentColor;

  async function copyAmount() {
    try {
      await navigator.clipboard.writeText(formatCurrency(amount));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const shareParams = new URLSearchParams({
    amount: amount.toFixed(2),
    annual: String(annual),
    workdays: String(workdays),
  });

  return (
    <main>
      <header className="mx-auto max-w-5xl px-6 pt-8 pb-2 flex items-center justify-between">
        <Link href={`/c/${campaign.slug}/calculate`} className="btn-tertiary text-sm">← Recalculate</Link>
        {campaign.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.logoDataUrl} alt={campaign.orgName} className="h-10 object-contain" />
        ) : (
          <Logo size="sm" centered={false} href={null} />
        )}
        <Link href={`/c/${campaign.slug}`} className="btn-tertiary text-sm">Campaign →</Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-6 pb-16">
        <div className="card surface-ink text-cloud p-6 sm:p-10 md:p-14 relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-60"
               style={{ background: `radial-gradient(circle at 50% 20%, ${accent}66 0%, transparent 60%)` }} />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cloud/60 break-words">{campaign.orgName} • {campaign.campaignName}</p>
            <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-cloud/70">Your One Day Offering</p>
            <p className="mt-3 font-display font-black leading-none text-[56px] sm:text-[72px] md:text-[96px]"
               style={{ color: accent }}>
              {formatCurrency(amount)}
            </p>
            <p className="mt-8 font-display font-bold text-xl text-cloud/90 leading-relaxed">
              One day of your work can help change someone&rsquo;s eternity.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm max-w-md mx-auto">
              <Stat label="Annual income" value={formatCurrency(annual, { cents: false })} />
              <Stat label="Estimated workdays" value={formatNumber(workdays)} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a href={campaign.givingLink} target="_blank" rel="noopener noreferrer"
             className="btn-ink w-full sm:w-auto sm:min-w-[320px] text-lg">
            Give My One Day Offering →
          </a>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link href={`/c/${campaign.slug}/share?${shareParams.toString()}`} className="btn-secondary">
              Share My One Day
            </Link>
            <Link href={`/c/${campaign.slug}/calculate`} className="btn-secondary">
              Recalculate
            </Link>
            <button type="button" onClick={copyAmount} className="btn-secondary">
              {copied ? "Copied ✓" : "Copy Amount"}
            </button>
          </div>
        </div>
      </section>

      {campaign.kingdomImpactMode && campaign.impacts.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="text-center mb-6">
            <p className="font-display font-bold text-sm uppercase tracking-[0.18em]" style={{ color: accent }}>
              What your One Day could do
            </p>
            <h2 className="mt-2 font-display font-black text-h3">Here&rsquo;s the math of meaning.</h2>
          </div>
          <ImpactGrid impacts={campaign.impacts} offering={amount} />
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cloud/5 px-4 py-3 border border-cloud/10">
      <p className="text-[10px] uppercase tracking-wide text-cloud/60">{label}</p>
      <p className="font-display font-bold text-cloud">{value}</p>
    </div>
  );
}
