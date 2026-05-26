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
      <div className="rounded-2xl border border-muted-soft bg-white p-4">
        <QRCodeSVG value={value} size={size} bgColor="#FFFFFF" fgColor="#111B27" />
      </div>
      {label && (
        <p className="mt-3 font-display font-bold text-sm uppercase tracking-wide text-ink/60">
          {label}
        </p>
      )}
    </div>
  );
}
