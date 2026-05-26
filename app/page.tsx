import Link from "next/link";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main>
      {/* Top nav — black bar, centered links */}
      <nav className="w-full bg-ink text-cloud">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-center gap-8 md:gap-12">
          <Link href="/how-it-works" className="font-sans text-sm text-cloud/90 hover:text-amber transition">
            How it works
          </Link>
          <Link href="/for-organizations" className="font-sans text-sm text-cloud/90 hover:text-amber transition">
            For organizations
          </Link>
          <Link href="/start" className="font-sans text-sm text-cloud/90 hover:text-amber transition">
            Start a campaign
          </Link>
        </div>
      </nav>

      {/* Hero — full logo, headline, description, single CTA */}
      <section className="relative overflow-hidden">
        {/* Amber glow centered behind the logo */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
          style={{
            background:
              "radial-gradient(50% 55% at 50% 22%, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0) 70%)",
          }}
        />

        <div className="relative mx-auto max-w-2xl px-6 pt-16 md:pt-20 pb-20 text-center">
          <Logo size="lg" centered href={null} />

          <h1 className="mt-14 font-display font-black leading-[1.08] text-[40px] md:text-[56px] text-ink">
            Discover what <span className="text-amber-pressed">one day</span> can do.
          </h1>

          <p className="mt-6 text-lg text-ink/70 leading-relaxed max-w-lg mx-auto">
            Show your people how one day of their work can become a meaningful act of generosity.
          </p>

          <div className="mt-10 flex justify-center">
            <Link href="/start" className="btn-primary">
              Start a Campaign →
            </Link>
          </div>
        </div>
      </section>

      {/* Three feature cards */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Simple math",
              body: "Enter what you make. We figure out what one working day of your income equals.",
            },
            {
              title: "Honest framing",
              body: "No guilt. No pressure. Just one inspiring number and the choice it opens.",
            },
            {
              title: "Real impact",
              body: "Every One Day Offering funds meals, missions, water and hope around the world.",
            },
          ].map((c) => (
            <div key={c.title} className="card p-6">
              <h3 className="font-display font-bold text-base text-ink">{c.title}</h3>
              <p className="mt-2 text-sm text-ink/65 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Big two-up card */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left — light, copy + CTAs */}
            <div className="p-10 md:p-14">
              <p className="font-display font-bold text-xs uppercase tracking-[0.2em] text-amber-pressed">
                For Organizations
              </p>
              <h2 className="mt-4 font-display font-black text-h3 leading-tight">
                Launch a branded One Day Offering campaign in minutes.
              </h2>
              <p className="mt-4 text-ink/70 leading-relaxed">
                Upload your logo, write your vision, paste your link. We&rsquo;ll generate a
                beautiful campaign page and a QR code your people can scan from a stage,
                screen or shared graphic.
              </p>
              <div className="mt-7 flex items-center gap-5">
                <Link href="/start" className="btn-primary">
                  Start a Campaign →
                </Link>
                <Link href="/how-it-works" className="btn-tertiary">
                  How it works ↗
                </Link>
              </div>
            </div>

            {/* Right — dark, live example */}
            <div className="surface-ink relative p-10 md:p-14 text-cloud">
              <div className="absolute inset-0 glow-amber opacity-50" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cloud/60">Live example</p>
                <p className="mt-3 font-display font-black text-4xl leading-tight">
                  $510.<span className="text-amber">64</span>
                </p>
                <p className="mt-2 text-cloud/70 text-sm">
                  on a $120,000 income, 235 workdays
                </p>
                <div className="mt-8 h-px bg-cloud/15" />
                <p className="mt-6 text-cloud/80 font-display font-bold">
                  &ldquo;One day of your work can help change someone&apos;s eternity.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
