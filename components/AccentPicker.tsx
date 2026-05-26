"use client";

import { useEffect, useState } from "react";

const PRESETS: { value: string; label: string }[] = [
  // Vibrant
  { value: "#FBBF24", label: "Amber" },
  { value: "#FB923C", label: "Tangerine" },
  { value: "#F87171", label: "Coral" },
  { value: "#EC4899", label: "Rose" },
  { value: "#A855F7", label: "Plum" },
  { value: "#5E6BF8", label: "Brand Blue" },
  { value: "#22C2FA", label: "Sky" },
  { value: "#14B8A6", label: "Teal" },
  // Neutrals
  { value: "#34D399", label: "Mint" },
  { value: "#111B27", label: "Ink" },
  { value: "#475569", label: "Slate" },
  { value: "#78716C", label: "Stone" },
];

export default function AccentPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [raw, setRaw] = useState(value.replace(/^#/, "").toUpperCase());

  // Keep the input in sync when value is changed externally (preset click, system picker, etc.)
  useEffect(() => {
    setRaw(value.replace(/^#/, "").toUpperCase());
  }, [value]);

  function handleRaw(input: string) {
    const cleaned = input.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6).toUpperCase();
    setRaw(cleaned);
    if (cleaned.length === 6) onChange(`#${cleaned}`);
  }

  // What the native picker + swatch should display while user is mid-type
  const fullHex = raw.length === 6 ? `#${raw}` : value;

  return (
    <div className="space-y-5">
      {/* Preset swatches */}
      <div className="grid grid-cols-6 gap-2">
        {PRESETS.map((opt) => {
          const active = value.toLowerCase() === opt.value.toLowerCase();
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={active}
              className={`relative aspect-square rounded-xl border transition ${
                active
                  ? "border-ink ring-2 ring-ink/40 ring-offset-2 ring-offset-white"
                  : "border-ink/10 hover:border-ink/30"
              }`}
              style={{ background: opt.value }}
            />
          );
        })}
      </div>

      {/* Custom hex */}
      <div>
        <p className="font-display font-bold text-[10px] uppercase tracking-[0.18em] text-ink/50 mb-2">
          Or use a custom hex
        </p>
        <div className="flex items-center gap-2">
          {/* Native color picker, styled as a square swatch */}
          <label
            className="relative inline-flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-muted-soft focus-within:ring-4 focus-within:ring-amber/20"
            style={{ background: fullHex }}
            title="Open system color picker"
          >
            <input
              type="color"
              value={fullHex}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Open system color picker"
            />
          </label>
          {/* Manual hex input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-ink/40">
              #
            </span>
            <input
              type="text"
              value={raw}
              onChange={(e) => handleRaw(e.target.value)}
              placeholder="FBBF24"
              maxLength={6}
              spellCheck={false}
              autoCapitalize="characters"
              className="input-base pl-9 font-mono uppercase tracking-wider"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Type six hex characters, or click the swatch to open your system color picker.
        </p>
      </div>
    </div>
  );
}
