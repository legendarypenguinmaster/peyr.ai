import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import WhyPeyrSection from "@/components/home/WhyPeyrSection";
import CoreFeaturesSection from "@/components/home/CoreFeaturesSection";
import GrowthToolsSection from "@/components/home/GrowthToolsSection";
import TrustLedgerSection from "@/components/home/TrustLedgerSection";
import WorkspaceHubSection from "@/components/home/WorkspaceHubSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import { redirectIfAuthenticated } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Redirect authenticated users to dashboard
  await redirectIfAuthenticated();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <HeroSection />
      <WhyPeyrSection />
      <CoreFeaturesSection />
      <GrowthToolsSection />
      <TrustLedgerSection />
      <WorkspaceHubSection />
      <CallToActionSection />
    </div>
  );
}
