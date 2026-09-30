"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  deleteCampaign,
  findDeviceOnlyCampaigns,
  getMe,
  listCampaigns,
  recoverDeviceCampaign,
  signOut,
} from "@/lib/storage";
import type { Campaign } from "@/lib/types";

export default function DashboardIndexPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [deviceOnly, setDeviceOnly] = useState<Campaign[]>([]);
  const [recovering, setRecovering] = useState(false);
  const [recoverError, setRecoverError] = useState("");

  useEffect(() => {
    listCampaigns().then((list) => {
      if (list === null) {
        router.replace("/login?next=/dashboard");
        return;
      }
      setCampaigns(list);
      findDeviceOnlyCampaigns().then(setDeviceOnly);
    });
    getMe().then(setMe);
  }, [router]);

  async function handleRecover() {
    setRecovering(true);
    setRecoverError("");
    const failed: Campaign[] = [];
    for (const c of deviceOnly) {
      try {
        await recoverDeviceCampaign(c);
      } catch (err) {
        failed.push(c);
        setRecoverError(err instanceof Error ? err.message : "Couldn't save campaign.");
      }
    }
    setDeviceOnly(failed);
    setCampaigns((await listCampaigns()) ?? []);
    setRecovering(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleDelete(e: React.MouseEvent, c: Campaign) {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Delete "${c.campaignName}"?\n\nThis removes the campaign from the server. Anyone who already has the campaign link will see a "Campaign not found" message.`
    );
    if (!ok) return;
    try {
      await deleteCampaign(c.slug);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete campaign.");
    }
    setCampaigns((await listCampaigns()) ?? []);
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-display font-bold text-sm uppercase tracking-[0.18em] text-amber-pressed">
              Campaign Dashboard
            </p>
            <h1 className="mt-2 font-display font-black text-[32px] sm:text-[40px] md:text-h2 leading-tight">
              Your campaigns
            </h1>
            {me && (
              <p className="mt-2 text-sm text-ink/60">
                Signed in as <span className="font-bold text-ink">{me}</span> ·{" "}
                <button type="button" onClick={handleSignOut} className="underline hover:text-ink">
                  Sign out
                </button>
              </p>
            )}
          </div>
          <Link href="/start" className="btn-primary w-full md:w-auto">+ New Campaign</Link>
        </div>

        {deviceOnly.length > 0 && (
          <div className="card p-7 mb-6 border-2 border-amber">
            <h2 className="font-display font-bold text-lg">
              We found {deviceOnly.length === 1 ? "a campaign" : `${deviceOnly.length} campaigns`} saved only on this device
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Save {deviceOnly.length === 1 ? "it" : "them"} to your login so donors on any device can
              open {deviceOnly.length === 1 ? "it" : "them"} and you can edit from anywhere. Your link
              and QR code stay the same.
            </p>
            <ul className="mt-3 text-sm list-disc list-inside text-ink/80">
              {deviceOnly.map((c) => (
                <li key={c.slug}>
                  <span className="font-bold">{c.orgName}</span> — {c.campaignName}{" "}
                  <span className="font-mono text-xs text-ink/50">/c/{c.slug}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={handleRecover} disabled={recovering} className="btn-primary mt-5">
              {recovering ? "Saving…" : "Save to my account"}
            </button>
            {recoverError && <p className="mt-3 text-sm text-coral">{recoverError}</p>}
          </div>
        )}

        {campaigns === null ? (
          <div className="card p-8 text-ink/50">Loading…</div>
        ) : campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <li key={c.slug} className="relative min-w-0">
                <Link href={`/dashboard/${c.slug}`} className="card p-7 block hover:shadow-glow transition overflow-hidden">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/50 pr-10 break-words">{c.orgName}</p>
                  <h3 className="mt-1 font-display font-bold text-xl pr-10 break-words">{c.campaignName}</h3>
                  <p className="mt-3 text-sm text-ink/60 line-clamp-2">{c.visionStatement || "No vision statement yet."}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-ink/50 truncate min-w-0">/c/{c.slug}</span>
                    <span className="inline-flex items-center gap-1 font-display font-bold text-ink shrink-0">
                      Open →
                    </span>
                  </div>
                </Link>
                {/* Delete — absolutely positioned, stops propagation so the card link isn't fired */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, c)}
                  className="absolute top-4 right-4 p-2 rounded-full text-ink/35 hover:text-coral hover:bg-coral/10 transition"
                  aria-label={`Delete campaign ${c.campaignName}`}
                  title="Delete campaign"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
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
