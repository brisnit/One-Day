import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CampaignWizard from "@/components/CampaignWizard";

export default function StartCampaignPage() {
  return (
    <main>
      <SiteHeader />
      <CampaignWizard />
      <SiteFooter />
    </main>
  );
}
