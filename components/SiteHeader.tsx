"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { href: "/",                  label: "Home" },
  { href: "/how-it-works",      label: "How it works" },
  { href: "/for-organizations", label: "For organizations" },
  { href: "/start",             label: "Start a campaign" },
];

export default function SiteHeader({ variant = "public" }: { variant?: "public" | "campaign" }) {
  const pathname = usePathname();
  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-4">
        <Logo size="md" centered />
        {variant === "public" && (
          <nav className="mt-6 flex justify-center gap-8 font-sans text-sm">
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
