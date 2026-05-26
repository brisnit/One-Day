import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  centered?: boolean;
  href?: string | null;
  /** Extra classes applied directly to the <Image>, e.g. for a border. */
  className?: string;
}

// Source asset is 263 × 101 — keep that aspect (2.604).
const SIZES = {
  sm: { w: 120, h: 46 },
  md: { w: 180, h: 69 },
  lg: { w: 263, h: 101 },
};

export default function Logo({
  size = "md",
  centered = true,
  href = "/",
  className = "",
}: LogoProps) {
  const { w, h } = SIZES[size];
  const img = (
    <Image
      src="/logo.png"
      alt="One Day Calculator — Convoy of Hope"
      width={w}
      height={h}
      priority
      className={`select-none ${className}`.trim()}
    />
  );
  const wrap = centered ? "flex justify-center" : "flex";
  return (
    <div className={wrap}>
      {href ? <Link href={href} aria-label="One Day Offering home">{img}</Link> : img}
    </div>
  );
}
