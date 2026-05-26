"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Field, Toggle } from "@/components/Field";
import AccentPicker from "@/components/AccentPicker";
import { ensureUniqueSlug, saveCampaign } from "@/lib/storage";
import { DEFAULT_IMPACTS } from "@/lib/mockData";
import { slugify } from "@/lib/format";
import type { Campaign, ImpactItem } from "@/lib/types";

export default function StartCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [orgName, setOrgName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [givingLink, setGivingLink] = useState("");
  const [vision, setVision] = useState("");
  const [accent, setAccent] = useState("#FBBF24");
  const [logoBackground, setLogoBackground] = useState<"light" | "dark">("light");
  const [kingdom, setKingdom] = useState(true);
  const [impactMessage, setImpactMessage] = useState("");
  const [impacts, setImpacts] = useState<ImpactItem[]>(DEFAULT_IMPACTS);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const previewSlug = useMemo(() => slugify(orgName + " " + campaignName) || "your-campaign", [orgName, campaignName]);

  const stepsTotal = 4;

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function toggleImpact(id: string) {
    setImpacts((prev) => prev.filter((i) => i.id !== id));
  }
  function restoreImpacts() {
    setImpacts(DEFAULT_IMPACTS);
  }

  function canAdvance() {
    if (step === 0) return orgName.trim().length > 1 && campaignName.trim().length > 1;
    if (step === 1) return givingLink.trim().startsWith("http");
    return true;
  }

  function finalize() {
    const slug = ensureUniqueSlug(slugify(orgName + " " + campaignName));
    const campaign: Campaign = {
      slug,
      orgName: orgName.trim(),
      campaignName: campaignName.trim(),
      visionStatement: vision.trim(),
      givingLink: givingLink.trim(),
      logoDataUrl,
      logoBackground,
      accentColor: accent,
      impactMessage: impactMessage.trim() || undefined,
      impacts,
      kingdomImpactMode: kingdom,
      createdAt: Date.now(),
    };
    saveCampaign(campaign);
    router.push(`/dashboard/${slug}`);
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 pt-6 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: stepsTotal }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= step ? "bg-amber" : "bg-muted-soft"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink/50">
            Step {step + 1} of {stepsTotal}
          </p>
        </div>

        <div className="card p-8 md:p-10">
          {step === 0 && (
            <Step
              title="Tell us about your campaign"
              subtitle="This appears at the top of your branded page and on the share card."
            >
              <Field label="Organization name" htmlFor="org">
                <input
                  id="org"
                  className="input-base"
                  placeholder="Convoy of Hope"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </Field>
              <Field label="Campaign name" htmlFor="campaign">
                <input
                  id="campaign"
                  className="input-base"
                  placeholder="One Day Can Change Forever"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </Field>
              <Field label="Organization logo (optional)" hint="PNG or SVG works best. We'll center it on your campaign page.">
                <div className="flex items-center gap-4">
                  <label className="btn-secondary cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
                    {logoDataUrl ? "Replace logo" : "Upload logo"}
                  </label>
                  {logoDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoDataUrl} alt="Logo preview" className="h-14 object-contain" />
                  )}
                </div>
              </Field>

              <Field
                label="Logo style"
                hint="Tells us which polarity to use for the campaign header — keeps your logo readable wherever it lands."
              >
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      v: "light" as const,
                      title: "Dark logo on light background",
                      desc: "Your logo is dark. Header uses light surface + dark text.",
                      bg: "#FFFFFF",
                      mark: "#111B27",
                      border: "#E5E9F2",
                    },
                    {
                      v: "dark" as const,
                      title: "Light logo on dark background",
                      desc: "Your logo is light. Header uses dark surface + light text.",
                      bg: "#0B1320",
                      mark: "#FFFFFF",
                      border: "#0B1320",
                    },
                  ]).map((opt) => {
                    const active = logoBackground === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setLogoBackground(opt.v)}
                        aria-pressed={active}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-ink ring-2 ring-ink/30"
                            : "border-muted-soft hover:border-ink/40"
                        }`}
                      >
                        {/* Visual preview block */}
                        <div
                          className="h-16 rounded-lg flex items-center justify-center mb-3"
                          style={{
                            background: opt.bg,
                            border: `1px solid ${opt.border}`,
                          }}
                        >
                          <div
                            className="h-2.5 w-14 rounded-full"
                            style={{ background: opt.mark }}
                          />
                        </div>
                        <p className="font-display font-bold text-sm text-ink leading-snug">
                          {opt.title}
                        </p>
                        <p className="mt-1 text-xs text-ink/60 leading-snug">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Pick an accent color" hint="Used for highlights, buttons, and your One Day number.">
                <AccentPicker value={accent} onChange={setAccent} />
              </Field>
            </Step>
          )}

          {step === 1 && (
            <Step
              title="Where should donors give?"
              subtitle="Your existing giving page. We don't process payments — we just point people to you."
            >
              <Field label="Giving link" htmlFor="link" hint="Must start with https://">
                <input
                  id="link"
                  className="input-base"
                  placeholder="https://yourorg.org/give"
                  value={givingLink}
                  onChange={(e) => setGivingLink(e.target.value)}
                />
              </Field>
              <Field label="Vision statement (optional)" hint="One or two sentences. Why this campaign? Why now?">
                <textarea
                  className="input-base min-h-[120px] resize-y"
                  placeholder="We believe one day of generosity can ripple into someone's forever..."
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                />
              </Field>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Kingdom Impact Mode"
              subtitle="Optional: turn on church / missions framing with impact categories and a vision-led message."
            >
              <Toggle
                checked={kingdom}
                onChange={setKingdom}
                label="Enable Kingdom Impact Mode"
                description="Adds the impact grid and a custom impact message to your campaign page."
              />
              {kingdom && (
                <div className="mt-6 space-y-5">
                  <Field label="Impact message (optional)">
                    <textarea
                      className="input-base min-h-[100px] resize-y"
                      placeholder="Your One Day Offering joins thousands of others to fund missions, disaster relief, and community outreach this year."
                      value={impactMessage}
                      onChange={(e) => setImpactMessage(e.target.value)}
                    />
                  </Field>
                  <div>
                    <p className="label-base">Impact categories</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DEFAULT_IMPACTS.map((item) => {
                        const active = impacts.some((i) => i.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              active
                                ? toggleImpact(item.id)
                                : setImpacts((prev) => [...prev, item])
                            }
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-ink bg-cloud"
                                : "border-muted-soft bg-white hover:border-ink/30"
                            }`}
                          >
                            <div className="text-xl">{item.emoji}</div>
                            <div className="mt-1 text-xs font-display font-bold">
                              {item.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={restoreImpacts}
                      className="mt-3 btn-tertiary text-sm"
                    >
                      Reset to all categories ↻
                    </button>
                  </div>
                </div>
              )}
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Review and launch"
              subtitle="You can edit any of this from your dashboard later."
            >
              <dl className="space-y-3 text-sm">
                <Row k="Organization" v={orgName || "—"} />
                <Row k="Campaign" v={campaignName || "—"} />
                <Row k="Giving link" v={givingLink || "—"} mono />
                <Row k="Kingdom Impact Mode" v={kingdom ? "On" : "Off"} />
                <Row k="Accent" v={accent} swatch={accent} />
                <Row k="Custom logo" v={logoDataUrl ? "Uploaded" : "Default (One Day Calculator)"} />
                <Row k="Logo style" v={logoBackground === "dark" ? "Light logo on dark bg" : "Dark logo on light bg"} />
                <Row k="Preview URL" v={`/c/${previewSlug}`} mono />
              </dl>
            </Step>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="btn-tertiary"
              disabled={step === 0}
            >
              ← Back
            </button>
            {step < stepsTotal - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(stepsTotal - 1, s + 1))}
                disabled={!canAdvance()}
                className="btn-primary"
              >
                Continue →
              </button>
            ) : (
              <button type="button" onClick={finalize} className="btn-primary">
                Launch Campaign ✨
              </button>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display font-black text-2xl text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-ink/60">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Row({ k, v, mono, swatch }: { k: string; v: string; mono?: boolean; swatch?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-muted-soft pb-2">
      <dt className="text-ink/60">{k}</dt>
      <dd className={`text-ink ${mono ? "font-mono text-xs" : "font-display font-bold"} text-right flex items-center gap-2`}>
        {swatch && <span className="inline-block h-3 w-3 rounded-full" style={{ background: swatch }} />}
        {v}
      </dd>
    </div>
  );
}
