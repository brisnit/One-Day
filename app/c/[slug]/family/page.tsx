"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import { CurrencyInput, Field, NumberInput, Select } from "@/components/Field";
import { annualizeEntry, DEFAULT_WORKDAYS_WITH_TIME_OFF } from "@/lib/calculator";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getCampaign } from "@/lib/storage";
import type { Campaign, IncomeEntry } from "@/lib/types";

type EntryType = IncomeEntry["type"];

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "annual",   label: "Annual" },
  { value: "monthly",  label: "Monthly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "weekly",   label: "Weekly" },
  { value: "hourly",   label: "Hourly" },
];

let entryCounter = 0;
function uid() {
  entryCounter += 1;
  return `e_${entryCounter}_${Math.random().toString(36).slice(2, 8)}`;
}
function newEntry(label: string): IncomeEntry {
  return { id: uid(), label, type: "annual", amount: 0 };
}

export default function FamilyCalculatorPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [entries, setEntries] = useState<IncomeEntry[]>([
    newEntry("Person 1"),
    newEntry("Person 2"),
  ]);
  const [workdays, setWorkdays] = useState<number | "">(DEFAULT_WORKDAYS_WITH_TIME_OFF);

  useEffect(() => {
    setCampaign(getCampaign(slug));
  }, [slug]);

  const totalAnnual = useMemo(
    () => entries.reduce((sum, e) => sum + annualizeEntry(e), 0),
    [entries]
  );

  const days = typeof workdays === "number" && workdays > 0 ? workdays : DEFAULT_WORKDAYS_WITH_TIME_OFF;
  const oneDay = totalAnnual / days;
  const valid = totalAnnual > 0 && days > 0;

  function update(id: string, patch: Partial<IncomeEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }
  function add() {
    setEntries((prev) => [...prev, newEntry(`Person ${prev.length + 1}`)]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !campaign) return;
    const qs = new URLSearchParams({
      annual: String(Math.round(totalAnnual)),
      workdays: String(days),
      amount: oneDay.toFixed(2),
    });
    router.push(`/c/${slug}/results?${qs.toString()}`);
  }

  if (campaign === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  }
  if (campaign === null) {
    return <main className="min-h-screen flex items-center justify-center"><p>Campaign not found.</p></main>;
  }
  const accent = campaign.accentColor;

  return (
    <main>
      <header className="mx-auto max-w-5xl px-6 pt-8 pb-2 flex items-center justify-between">
        <Link href={`/c/${campaign.slug}`} className="btn-tertiary text-sm">← Back</Link>
        {campaign.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.logoDataUrl} alt={campaign.orgName} className="h-10 object-contain" />
        ) : (
          <Logo size="sm" centered={false} href={null} />
        )}
        <Link href={`/c/${campaign.slug}/calculate`} className="btn-tertiary text-sm">Single calculator →</Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-6 pb-20">
        <div className="text-center mb-10">
          <p className="font-display font-bold text-sm uppercase tracking-[0.2em]" style={{ color: accent }}>
            Household Calculator
          </p>
          <h1 className="mt-3 font-display font-black text-[32px] sm:text-[40px] md:text-h2 leading-tight">
            One Day for the <span style={{ color: accent }}>whole household</span>.
          </h1>
          <p className="mt-3 text-ink/60 max-w-xl mx-auto">
            Add each income source. We&rsquo;ll combine them into a single household One Day Offering.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
          <div className="card p-6 md:p-9">
            <ul className="space-y-4">
              {entries.map((entry, i) => (
                <li key={entry.id} className="rounded-2xl border border-muted-soft bg-cloud p-5">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      value={entry.label ?? ""}
                      onChange={(e) => update(entry.id, { label: e.target.value })}
                      className="font-display font-bold text-lg bg-transparent border-none outline-none p-0 w-full"
                      placeholder={`Person ${i + 1}`}
                    />
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(entry.id)}
                        className="text-coral text-sm font-medium hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Type">
                      <Select<EntryType>
                        value={entry.type}
                        onChange={(v) => update(entry.id, { type: v })}
                        options={TYPE_OPTIONS}
                      />
                    </Field>
                    {entry.type === "hourly" ? (
                      <>
                        <Field label="Hourly rate">
                          <CurrencyInput
                            value={entry.hourlyRate ?? ""}
                            onChange={(v) => update(entry.id, { hourlyRate: typeof v === "number" ? v : 0 })}
                          />
                        </Field>
                        <Field label="Hours per week">
                          <NumberInput
                            value={entry.hoursPerWeek ?? ""}
                            onChange={(v) => update(entry.id, { hoursPerWeek: typeof v === "number" ? v : 0 })}
                            suffix="hrs/wk"
                          />
                        </Field>
                      </>
                    ) : (
                      <Field label="Amount">
                        <CurrencyInput
                          value={entry.amount || ""}
                          onChange={(v) => update(entry.id, { amount: typeof v === "number" ? v : 0 })}
                        />
                      </Field>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-ink/50">
                    Annual: <span className="font-display font-bold text-ink/70">{formatCurrency(annualizeEntry(entry), { cents: false })}</span>
                  </p>
                </li>
              ))}
            </ul>

            <button type="button" onClick={add} className="btn-secondary mt-4">
              + Add another person
            </button>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Field label="Estimated workdays" hint="Default: 235 (after vacation, sick days, holidays).">
                <NumberInput value={workdays} onChange={setWorkdays} suffix="days/yr" />
              </Field>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 self-start">
            <div className="card p-7 surface-ink text-cloud relative overflow-hidden">
              <div className="absolute inset-0 opacity-50"
                   style={{ background: `radial-gradient(circle at 50% 0%, ${accent}55, transparent 60%)` }} />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.18em] text-cloud/60">Household One Day</p>
                <p className="mt-3 font-display font-black leading-none text-[44px] sm:text-[56px] break-words"
                   style={{ color: accent }}>
                  {valid ? formatCurrency(oneDay) : "$—"}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-cloud/5 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-cloud/60">Combined</p>
                    <p className="font-display font-bold">
                      {totalAnnual ? formatCurrency(totalAnnual, { cents: false }) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-cloud/5 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-cloud/60">Workdays</p>
                    <p className="font-display font-bold">{formatNumber(days)}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!valid}
                  className="btn-ink w-full mt-7"
                >
                  See Our Result →
                </button>
              </div>
            </div>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
