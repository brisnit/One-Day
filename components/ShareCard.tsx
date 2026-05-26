"use client";

import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Campaign } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface ShareCardProps {
  campaign: Campaign;
  offering: number;
  shareUrl: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { campaign, offering, shareUrl },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative mx-auto w-[360px] aspect-[3/4] rounded-3xl overflow-hidden text-cloud surface-ink shadow-card"
      style={{ fontFamily: "Roboto, Inter, system-ui, sans-serif" }}
    >
      <div className="absolute inset-0 opacity-60 glow-amber" />
      <div className="relative flex h-full flex-col p-7">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-cloud/60">
          <span>{campaign.orgName}</span>
          <span>One Day Offering</span>
        </div>

        <div className="mt-6">
          <p className="font-bold text-xs uppercase tracking-[0.18em] text-amber">
            My One Day Offering
          </p>
          <p
            className="mt-2 font-black leading-none text-amber drop-shadow"
            style={{ fontSize: 56 }}
          >
            {formatCurrency(offering)}
          </p>
        </div>

        <p className="mt-6 text-lg font-bold leading-snug text-cloud">
          {campaign.campaignName}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-cloud/75">
          One day of my work can help change someone's forever.
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cloud/50">
              Join the campaign
            </p>
            <p className="font-bold text-sm text-cloud break-all max-w-[180px]">
              {shareUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
          <div className="rounded-xl bg-white p-2">
            <QRCodeSVG value={shareUrl} size={72} bgColor="#FFFFFF" fgColor="#111B27" />
          </div>
        </div>

        <div className="absolute right-7 top-7 h-1 w-8 rounded-full bg-amber" />
      </div>
    </div>
  );
});

export default ShareCard;
