"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CampaignWizard from "@/components/CampaignWizard";
import { getCampaignForOwner, getMe } from "@/lib/storage";
import type { Campaign } from "@/lib/types";

export default function EditCampaignPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<(Campaign & { canEdit: boolean }) | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (!(await getMe())) {
        router.replace(`/login?next=/dashboard/${slug}/edit`);
        return;
      }
      setCampaign(await getCampaignForOwner(slug));
    })();
  }, [slug, router]);

  let body: React.ReactNode;
  if (campaign === undefined) {
    body = <div className="mx-auto max-w-2xl px-6 py-20 text-ink/50">Loading campaign…</div>;
  } else if (!campaign || !campaign.canEdit) {
    body = (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display font-black text-h3">Can&rsquo;t edit this campaign</h1>
        <p className="mt-3 text-ink/60">
          This campaign doesn&rsquo;t exist or isn&rsquo;t owned by your login.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">Back to dashboard</Link>
      </div>
    );
  } else {
    const { canEdit: _canEdit, ...initial } = campaign;
    body = (
      <>
        <div className="mx-auto max-w-2xl px-6 pt-6">
          <Link href={`/dashboard/${slug}`} className="btn-tertiary text-sm">← Back to campaign</Link>
        </div>
        <CampaignWizard initial={initial} />
      </>
    );
  }

  return (
    <main>
      <SiteHeader />
      {body}
      <SiteFooter />
    </main>
  );
}
