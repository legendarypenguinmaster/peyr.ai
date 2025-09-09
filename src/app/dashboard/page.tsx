import { requireAuth, requireProfile } from "@/lib/auth";
import DashboardHeader from "@/components/layout/DashboardHeader";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import RecommendedCoFounders from "@/components/dashboard/RecommendedCoFounders";
import ActiveCollaborations from "@/components/dashboard/ActiveCollaborations";
import RecentMessages from "@/components/dashboard/RecentMessages";
import AIInsights from "@/components/dashboard/AIInsights";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import TrustScore from "@/components/dashboard/TrustScore";
import QuickActions from "@/components/dashboard/QuickActions";
import EscrowStatus from "@/components/dashboard/EscrowStatus";

export default async function Dashboard() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  await requireProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <WelcomeBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <RecommendedCoFounders />
            <ActiveCollaborations />
            <RecentMessages />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AIInsights />
            <ProfileCompletion />
            <TrustScore />
            <QuickActions />
            <EscrowStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
