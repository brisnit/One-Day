export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-3 text-center">
        <p className="font-display font-bold text-ink">One day can change someone's forever.</p>
        <p className="font-sans text-sm text-ink/60">
          © {new Date().getFullYear()} One Day Offering — a generosity tool by Convoy of Hope.
        </p>
      </div>
    </footer>
  );
}
