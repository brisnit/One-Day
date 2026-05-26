"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import ImpactGrid from "@/components/ImpactGrid";
import { getCampaign } from "@/lib/storage";
import { isLightColor } from "@/lib/format";
import type { Campaign } from "@/lib/types";

const DEFAULT_IMPACT_DESCRIPTION =
  "Your donations go to assist these needs in countries all over the world";

export default function CampaignLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);

  useEffect(() => {
    setCampaign(getCampaign(slug));
  }, [slug]);

  if (campaign === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  }
  if (campaign === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <Logo size="md" />
          <h1 className="mt-6 font-display font-black text-h3">Campaign not found</h1>
          <p className="mt-3 text-ink/60">Double-check the link, or head back to the home page.</p>
          <Link href="/" className="btn-primary mt-6 inline-flex">Go home</Link>
        </div>
      </main>
    );
  }

  const accent = campaign.accentColor;
  // Org-chosen polarity (with fallback to accent luminance for legacy campaigns).
  // Drives text contrast on the accent panels (quote + ready strip).
  const explicit = campaign.logoBackground;
  const isLight = explicit ? explicit === "light" : isLightColor(accent);
  const onAccent = isLight ? "#000000" : "#ffffff";
  const onAccentSubtle = isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)";

  return (
    <main>
      {/* Header — accent gradient, org logo only */}
      <header
        className="relative"
        style={{
          background: `linear-gradient(180deg,
            color-mix(in srgb, ${accent} 78%, white) 0%,
            ${accent} 55%,
            color-mix(in srgb, ${accent} 88%, black) 100%)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-6 pt-12 md:pt-14 pb-12 text-center">
          {campaign.logoDataUrl ? (
            <div className="flex items-center justify-center h-24 max-w-[320px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={campaign.logoDataUrl}
                alt={`${campaign.orgName} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <p
              className="font-display font-black text-2xl md:text-3xl uppercase tracking-[0.12em]"
              style={{ color: onAccent }}
            >
              {campaign.orgName}
            </p>
          )}
        </div>
      </header>

      {/* Hero on light surface — wordmark, headline, description, CTAs all in black */}
      <section style={{ background: "#F7F8FC" }}>
        <div className="mx-auto max-w-3xl px-6 pt-16 md:pt-20 pb-16 text-center">
          {/* ONE DAY CALCULATOR wordmark, always black on the light surface */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="One Day Calculator — Convoy of Hope"
              width={200}
              height={77}
              className="select-none"
              style={{ filter: "brightness(0)" }}
              draggable={false}
            />
          </div>

          <h1
            className="mt-10 font-display font-black text-[44px] md:text-[64px] leading-[1.05]"
            style={{ color: "#000000" }}
          >
            Discover what one day can do
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "#000000" }}
          >
            One day of your work can become a meaningful act of generosity.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={`/c/${campaign.slug}/calculate`} className="btn-ink">
              Calculate my one day offering →
            </Link>
            <Link href={`/c/${campaign.slug}/family`} className="btn-secondary">
              Household Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Quote section — accent bg, contrast text */}
      {campaign.visionStatement && (
        <section style={{ background: accent }}>
          <div className="mx-auto max-w-3xl px-6 py-14 text-center">
            <p
              className="font-display font-bold text-xl md:text-2xl leading-relaxed"
              style={{ color: onAccent }}
            >
              &ldquo;{campaign.visionStatement}&rdquo;
            </p>
            <p
              className="mt-4 text-xs uppercase tracking-[0.2em]"
              style={{ color: onAccentSubtle }}
            >
              — {campaign.orgName}
            </p>
          </div>
        </section>
      )}

      {/* Kingdom Impact (cards stay as-is) */}
      {campaign.kingdomImpactMode && campaign.impacts.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
          <div className="text-center mb-8">
            <p
              className="font-display font-bold text-sm uppercase tracking-[0.18em]"
              style={{ color: accent }}
            >
              Kingdom Impact
            </p>
            <h2 className="mt-2 font-display font-black text-h3">
              Where your one day goes
            </h2>
            <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
              {campaign.impactMessage || DEFAULT_IMPACT_DESCRIPTION}
            </p>
          </div>
          <ImpactGrid impacts={campaign.impacts} />
        </section>
      )}

      {/* Ready CTA strip — accent bg, stroke CTAs */}
      <section style={{ background: accent }}>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p
            className="font-display font-bold text-[11px] uppercase tracking-[0.22em]"
            style={{ color: onAccent }}
          >
            Ready?
          </p>
          <h2
            className="mt-3 font-display font-black text-h2 leading-tight"
            style={{ color: onAccent }}
          >
            One day of your work can change someone&rsquo;s forever
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/c/${campaign.slug}/calculate`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#000000] border border-[#ffffff] px-7 py-3.5 font-display font-bold text-[#ffffff] transition hover:opacity-90"
            >
              Calculate my one day offering →
            </Link>
            <a
              href={campaign.givingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffffff] border border-[#000000] px-7 py-3.5 font-display font-bold text-[#000000] transition hover:opacity-90"
            >
              I know my gift amount — Give Now
            </a>
          </div>
          <div className="mt-5">
            <Link
              href={`/c/${campaign.slug}/family`}
              className="inline-flex items-center gap-1 font-display font-bold text-sm underline underline-offset-4 hover:opacity-80"
              style={{ color: onAccent }}
            >
              Or calculate as a household →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
