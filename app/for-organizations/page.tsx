import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const BENEFITS = [
  {
    n: "01",
    title: "Branded landing page",
    body: "Your logo, your vision, your giving link. Donors land somewhere that feels like you.",
  },
  {
    n: "02",
    title: "Instant QR code",
    body: "Put it on a screen, a card, or the back of a t-shirt. People scan and calculate in seconds.",
  },
  {
    n: "03",
    title: "Kingdom impact mode",
    body: "For churches and missions — add impact categories, custom message and a vision statement.",
  },
  {
    n: "04",
    title: "Share graphics",
    body: "Donors can share a beautiful card showing what One Day equals.",
  },
];

export default function ForOrganizationsPage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-xl px-6 pt-6 pb-10 text-center">
        <p className="font-display font-bold text-xs uppercase tracking-[0.22em] text-amber-pressed">
          For Churches, Nonprofits &amp; Missions
        </p>
        <h1 className="mt-4 font-display font-black text-[28px] md:text-[36px] leading-[1.15] text-ink">
          An easy way to create a generosity campaign that energizes your members to Participate &amp; share
        </h1>
        <p className="mt-5 text-ink/70 leading-relaxed">
          Build a branded One Day Offering page your people can actually feel.
          Free to set up. No payments processed here, donors give through your link.
        </p>
        <div className="mt-7 flex justify-center">
          <Link href="/start" className="btn-primary">
            Start a Campaign →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BENEFITS.map((b) => (
            <li key={b.n} className="card p-6 flex gap-5 items-start">
              <span className="font-display font-black text-xl text-amber-pressed shrink-0 w-6 leading-snug">
                {b.n}
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-ink">{b.title}</h3>
                <p className="mt-1 text-sm text-ink/65 leading-relaxed">{b.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
