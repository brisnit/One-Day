"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import MobileMenu, { type NavLink } from "./MobileMenu";

const NAV: NavLink[] = [
  { href: "/",                  label: "Home" },
  { href: "/how-it-works",      label: "How it works" },
  { href: "/for-organizations", label: "For organizations" },
  { href: "/start",             label: "Start a campaign" },
];

export default function SiteHeader({ variant = "public" }: { variant?: "public" | "campaign" }) {
  const pathname = usePathname();
  return (
    <header className="w-full">
      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-4">
        {/* Mobile hamburger — top right, hidden on md+ */}
        {variant === "public" && (
          <div className="absolute right-4 top-6 sm:right-6">
            <MobileMenu links={NAV} />
          </div>
        )}

        <Logo size="md" centered />

        {/* Desktop nav — hidden on mobile */}
        {variant === "public" && (
          <nav className="mt-6 hidden md:flex justify-center gap-8 font-sans text-sm">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "font-bold text-ink" : "text-ink/70 hover:text-ink"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
