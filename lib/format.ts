export function formatCurrency(value: number, opts: { cents?: boolean } = {}): string {
  if (!isFinite(value)) return "$0";
  const cents = opts.cents ?? true;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * YIQ-based perceived brightness. Returns true if the color is light enough
 * that dark text reads well on it; false if it's dark enough to need light text.
 * Threshold of 140 leaves comfortable headroom for borderline mid-tones.
 */
export function isLightColor(hex: string): boolean {
  const normalized = hex.replace(/^#/, "");
  if (normalized.length !== 6) return true;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140;
}

/** Returns the appropriate primary text color ("#000000" or "#ffffff") for a given background hex. */
export function textOn(hex: string): "#000000" | "#ffffff" {
  return isLightColor(hex) ? "#000000" : "#ffffff";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
