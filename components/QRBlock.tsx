"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QRBlock({
  value,
  label,
  size = 200,
}: {
  value: string;
  label?: string;
  size?: number;
}) {
  return (
    <div className="card p-6 flex flex-col items-center">
      <div
        className="rounded-2xl border border-muted-soft bg-white p-4 w-full"
        style={{ maxWidth: size + 32 /* +32 to account for p-4 padding on both sides */ }}
      >
        {/* max-w-full + h-auto lets the SVG scale down to fit narrow viewports
            even though its intrinsic size is `size` px. */}
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#FFFFFF"
          fgColor="#111B27"
          className="block max-w-full h-auto"
        />
      </div>
      {label && (
        <p className="mt-3 font-display font-bold text-sm uppercase tracking-wide text-ink/60">
          {label}
        </p>
      )}
    </div>
  );
}
