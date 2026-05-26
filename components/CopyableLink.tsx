"use client";

import { useState } from "react";

export default function CopyableLink({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2 min-w-0">
      {/* min-w-0 here lets the flex item shrink past its intrinsic content width,
          which is what makes `truncate` actually truncate inside a flex container. */}
      <div className="flex-1 min-w-0 rounded-2xl border border-muted-soft bg-white px-4 py-3 font-sans text-sm text-ink truncate">
        {value}
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* noop */
          }
        }}
        className="shrink-0 rounded-2xl bg-ink px-4 font-display font-bold text-cloud hover:bg-ink/90 transition"
      >
        {copied ? "Copied ✓" : label ?? "Copy"}
      </button>
    </div>
  );
}
