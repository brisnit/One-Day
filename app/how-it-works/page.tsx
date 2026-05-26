import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const STEPS = [
  {
    n: "01",
    title: "Tell us how you’re paid.",
    body: "Annual, monthly, biweekly, hourly, or your whole household — pick what fits.",
  },
  {
    n: "02",
    title: "Set your working days.",
    body: "Most people work 235 days a year after vacation, sick days, and holidays. You can adjust it.",
  },
  {
    n: "03",
    title: "See your One Day.",
    body: "We divide one year of members income by one year of their workdays. That’s it.",
  },
  {
    n: "04",
    title: "Give and share.",
    body: "Use the organization’s giving link/QR code, or share a card that invites someone to calculate theirs.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-xl px-6 pt-6 pb-10 text-center">
        <p className="font-display font-bold text-xs uppercase tracking-[0.22em] text-amber-pressed">
          Simple Math. Meaningful Results.
        </p>
        <h1 className="mt-4 font-display font-black text-[36px] leading-[1.1] text-ink">
          How it works
        </h1>
        <p className="mt-5 text-ink/70 leading-relaxed">
          We ask your members a series of questions that creates one day giving statement they can share and
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-6 pb-6">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STEPS.map((s) => (
            <li key={s.n} className="card p-6 flex gap-5 items-start">
              <span className="font-display font-black text-xl text-amber-pressed shrink-0 w-6 leading-snug">
                {s.n}
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-ink/65 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Formula card */}
      <section className="mx-auto max-w-3xl px-6 pb-8">
        <div className="card surface-ink text-cloud p-7 relative overflow-hidden">
          <div className="absolute inset-0 glow-amber opacity-25" />
          <div className="relative">
            <p className="font-display font-bold text-[10px] uppercase tracking-[0.22em] text-cloud/60">
              The Formula
            </p>
            <p className="mt-3 font-display font-bold text-lg leading-snug">
              Annual Income ÷ Estimated Workdays ={" "}
              <span className="text-amber">Your One Day Offering</span>
            </p>
            <p className="mt-3 text-cloud/70 text-sm leading-relaxed">
              For most full-time workers, that’s their salary divided by ~235 days a year.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-xl px-6 pb-16 flex justify-center">
        <Link href="/start" className="btn-primary">
          Start a Campaign →
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
