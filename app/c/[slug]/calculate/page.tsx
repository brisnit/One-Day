"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import { CurrencyInput, Field, NumberInput, Select } from "@/components/Field";
import {
  DEFAULT_WORKDAYS_WITH_TIME_OFF,
  SCHEDULE_WORKDAYS,
  calculate,
  validate,
} from "@/lib/calculator";
import { formatCurrency, formatNumber, isLightColor } from "@/lib/format";
import { getCampaign } from "@/lib/storage";
import type { CalculatorInput, IncomeType, WorkSchedule, Campaign } from "@/lib/types";

const INCOME_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "annual",     label: "Annual salary" },
  { value: "monthly",    label: "Monthly income" },
  { value: "biweekly",   label: "Biweekly pay" },
  { value: "weekly",     label: "Weekly pay" },
  { value: "hourly",     label: "Hourly worker" },
  { value: "household",  label: "Household / family income" },
];

const SCHEDULE_OPTIONS: { value: WorkSchedule; label: string }[] = [
  { value: "7",      label: "7 days/week (365)" },
  { value: "custom", label: "Custom" },
];

export default function CalculatePage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);

  useEffect(() => {
    setCampaign(getCampaign(slug));
  }, [slug]);

  const [incomeType, setIncomeType] = useState<IncomeType>("annual");
  const [amount, setAmount] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [hoursPerWeek, setHoursPerWeek] = useState<number | "">("");
  const [schedule, setSchedule] = useState<WorkSchedule>("7");
  const [customWorkdays, setCustomWorkdays] = useState<number | "">(DEFAULT_WORKDAYS_WITH_TIME_OFF);

  const input: CalculatorInput = useMemo(() => ({
    incomeType,
    amount: typeof amount === "number" ? amount : 0,
    hourlyRate: typeof hourlyRate === "number" ? hourlyRate : undefined,
    hoursPerWeek: typeof hoursPerWeek === "number" ? hoursPerWeek : undefined,
    schedule,
    customWorkdays: typeof customWorkdays === "number" ? customWorkdays : undefined,
    excludeDaysOff: false,
  }), [incomeType, amount, hourlyRate, hoursPerWeek, schedule, customWorkdays]);

  const issues = validate(input);
  const issueByField = Object.fromEntries(issues.map((i) => [i.field, i.message]));
  const result = useMemo(() => calculate(input), [input]);
  const ready = issues.length === 0 && result.annualIncome > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    const qs = new URLSearchParams({
      annual: String(Math.round(result.annualIncome)),
      workdays: String(result.adjustedWorkdays),
      amount: result.oneDayOffering.toFixed(2),
    });
    router.push(`/c/${slug}/results?${qs.toString()}`);
  }

  if (campaign === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  }
  if (campaign === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink/60">Campaign not found.</p>
      </main>
    );
  }
  const accent = campaign.accentColor;
  // The dark `surface-ink` cards need a readable foreground for the big result
  // number. Light accents (amber, mint, sky, etc.) read fine; dark accents
  // (ink, plum, slate, brand blue) disappear, so fall back to white.
  const accentOnDark = isLightColor(accent) ? accent : "#ffffff";

  return (
    <main>
      <header className="mx-auto max-w-5xl px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href={`/c/${campaign.slug}`} className="btn-tertiary text-sm">← Back</Link>
        {campaign.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.logoDataUrl} alt={campaign.orgName} className="h-10 object-contain" />
        ) : (
          <Logo size="sm" centered={false} href={null} />
        )}
        <Link href={`/c/${campaign.slug}/family`} className="btn-tertiary text-sm">Household →</Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-4 pb-20">
        <div className="text-center mb-10">
          <p className="font-display font-bold text-sm uppercase tracking-[0.2em]" style={{ color: accent }}>
            {campaign.campaignName}
          </p>
          <h1 className="mt-3 font-display font-black text-[32px] sm:text-[40px] md:text-h2 leading-tight">
            What&apos;s your <span style={{ color: accent }}>one day</span> worth?
          </h1>
          <p className="mt-3 text-ink/60 max-w-xl mx-auto">
            Tell us how you&rsquo;re paid and we&rsquo;ll figure out the rest. Nothing is saved or shared.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
          {/* Inputs */}
          <div className="card p-6 md:p-9">
            <Field label="Income type" htmlFor="incomeType">
              <Select
                id="incomeType"
                value={incomeType}
                onChange={(v) => setIncomeType(v)}
                options={INCOME_OPTIONS}
              />
            </Field>

            {incomeType === "household" ? (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-cloud p-5">
                <p className="font-display font-bold text-sm">Multiple incomes?</p>
                <p className="text-sm text-ink/60 mt-1">
                  Use the dedicated Household Calculator — it adds each person&apos;s income together.
                </p>
                <Link href={`/c/${campaign.slug}/family`} className="btn-ink mt-4 inline-flex">
                  Open Household Calculator →
                </Link>
              </div>
            ) : incomeType === "hourly" ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Hourly rate" htmlFor="rate" error={issueByField["hourlyRate"]}>
                  <CurrencyInput id="rate" value={hourlyRate} onChange={setHourlyRate} placeholder="25" />
                </Field>
                <Field label="Hours per week" htmlFor="hours" error={issueByField["hoursPerWeek"]}>
                  <NumberInput id="hours" value={hoursPerWeek} onChange={setHoursPerWeek} placeholder="40" suffix="hrs/wk" />
                </Field>
              </div>
            ) : (
              <Field
                label={
                  incomeType === "annual"   ? "Annual income"   :
                  incomeType === "monthly"  ? "Monthly income"  :
                  incomeType === "biweekly" ? "Biweekly pay"    :
                                              "Weekly pay"
                }
                htmlFor="amount"
                error={issueByField["amount"]}
              >
                <CurrencyInput id="amount" value={amount} onChange={setAmount} placeholder="120000" />
              </Field>
            )}

            <div className="h-px bg-muted-soft my-2" />

            <Field label="Work schedule" htmlFor="schedule">
              <Select
                id="schedule"
                value={schedule}
                onChange={(v) => setSchedule(v)}
                options={SCHEDULE_OPTIONS}
              />
            </Field>

            {schedule === "custom" && (
              <Field label="Custom workdays per year" htmlFor="customWorkdays"
                     error={issueByField["customWorkdays"]}>
                <NumberInput id="customWorkdays" value={customWorkdays} onChange={setCustomWorkdays} placeholder="235" suffix="days/yr" />
              </Field>
            )}

          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-6 self-start">
            <div className="card p-7 surface-ink text-cloud relative overflow-hidden">
              <div className="absolute inset-0 opacity-50"
                   style={{ background: `radial-gradient(circle at 50% 0%, ${accent}55, transparent 60%)` }} />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.18em] text-cloud/60">Your One Day Offering</p>
                <p className="mt-3 font-display font-black leading-none text-[44px] sm:text-[56px] break-words" style={{ color: accentOnDark }}>
                  {ready ? formatCurrency(result.oneDayOffering) : "$—"}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-cloud/5 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-cloud/60">Annual</p>
                    <p className="font-display font-bold">
                      {result.annualIncome ? formatCurrency(result.annualIncome, { cents: false }) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-cloud/5 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-cloud/60">Workdays</p>
                    <p className="font-display font-bold">{formatNumber(result.adjustedWorkdays)}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!ready}
                  className="btn-ink w-full mt-7"
                >
                  See My Result →
                </button>
                <p className="mt-4 text-center text-[11px] text-cloud/50">
                  {ready ? "Looks good. Press to lock in your number." : "Fill in the fields to see your One Day."}
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}
