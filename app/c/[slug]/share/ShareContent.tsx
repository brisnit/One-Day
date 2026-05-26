"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import ShareCard from "@/components/ShareCard";
import { getCampaign } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [origin, setOrigin] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCampaign(getCampaign(slug));
    setOrigin(window.location.origin);
  }, [slug]);

  const amount = Number(params.get("amount") ?? 0);

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
        <h1 className="mt-6 font-display font-black text-h3">Nothing to share yet</h1>
        <p className="mt-3 text-ink/60">Calculate your One Day first.</p>
        <Link href={`/c/${campaign.slug}/calculate`} className="btn-ink mt-6 inline-flex">
          Calculate →
        </Link>
      </main>
    );
  }

  const shareUrl = `${origin}/c/${campaign.slug}`;

  async function downloadCard() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `one-day-offering-${campaign?.slug ?? "share"}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Couldn't generate the image. Try taking a screenshot.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyShareText() {
    const text =
      `My One Day Offering is ${formatCurrency(amount)}. ` +
      `One day of my work can help change someone's forever — ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <main>
      <header className="mx-auto max-w-5xl px-6 pt-8 pb-2 flex items-center justify-between">
        <Link href={`/c/${campaign.slug}/results?amount=${amount}`} className="btn-tertiary text-sm">← Back to result</Link>
        {campaign.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.logoDataUrl} alt={campaign.orgName} className="h-10 object-contain" />
        ) : (
          <Logo size="sm" centered={false} href={null} />
        )}
        <span className="w-20" aria-hidden />
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-6 pb-20">
        <div className="text-center mb-10">
          <p className="font-display font-bold text-sm uppercase tracking-[0.2em] text-amber-pressed">
            Share Your One Day
          </p>
          <h1 className="mt-3 font-display font-black text-[32px] sm:text-[40px] md:text-h2 leading-tight">
            Invite someone else to <span className="text-amber-pressed">calculate theirs.</span>
          </h1>
          <p className="mt-3 text-ink/60 max-w-xl mx-auto">
            Download this card or copy a share message. Every share is an invitation.
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start justify-center">
          <div className="flex justify-center">
            <ShareCard ref={cardRef} campaign={campaign} offering={amount} shareUrl={shareUrl} />
          </div>

          <div className="space-y-3 max-w-md">
            <button type="button" onClick={downloadCard} disabled={downloading} className="btn-ink w-full">
              {downloading ? "Generating…" : "Download Card (PNG)"}
            </button>
            <button type="button" onClick={copyShareText} className="btn-secondary w-full">
              {copied ? "Copied ✓" : "Copy Share Message"}
            </button>
            <a href={campaign.givingLink} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
              Give My One Day Offering →
            </a>

            <div className="card p-6 mt-6 text-sm">
              <p className="font-display font-bold">Ideas for sharing</p>
              <ul className="mt-3 space-y-1.5 text-ink/70 list-disc list-inside">
                <li>Post the card to your story</li>
                <li>Text it to a friend with one sentence</li>
                <li>Print it on a card for your small group</li>
                <li>Tag your church or organization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
