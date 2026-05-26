import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Logo size="md" />
      <p className="mt-8 font-display font-bold text-sm uppercase tracking-[0.2em] text-amber-pressed">404</p>
      <h1 className="mt-3 font-display font-black text-h2">We couldn&rsquo;t find that page.</h1>
      <p className="mt-3 text-ink/60 max-w-md">
        The campaign or page you&rsquo;re looking for doesn&rsquo;t exist. Try the home page or start a new campaign.
      </p>
      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/start" className="btn-secondary">Start a campaign</Link>
      </div>
    </main>
  );
}
