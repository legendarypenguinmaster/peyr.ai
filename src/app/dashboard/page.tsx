import { requireAuth, requireProfile } from "@/lib/auth";
import DashboardHeader from "@/components/layout/DashboardHeader";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import RecommendedCoFounders from "@/components/dashboard/RecommendedCoFounders";
import RecommendedProjects from "@/components/dashboard/RecommendedProjects";
import AIInsights from "@/components/dashboard/AIInsights";
import ActiveCollaborations from "@/components/dashboard/ActiveCollaborations";
import RecentMessages from "@/components/dashboard/RecentMessages";
import ProfileCompletion from "@/components/dashboard/ProfileCompletion";
import TrustScore from "@/components/dashboard/TrustScore";
import QuickActions from "@/components/dashboard/QuickActions";

export const dynamic = 'force-dynamic';
import EscrowStatus from "@/components/dashboard/EscrowStatus";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

export default async function Dashboard() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  return (
    <ClientPageWrapper loadingText="Loading your dashboard...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardHeader />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="pb-8">
            <WelcomeBanner />
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Matches
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trust Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8.5</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Response Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">2h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Top Row - Recommended Section Full Width */}
              <div className="mb-8">
                {profile.role === "founder" ? <RecommendedCoFounders /> : <RecommendedProjects />}
              </div>

              {/* Middle Row - AI Insights */}
              <div className="mb-8">
                <AIInsights />
              </div>

              {/* Below AI Insights - Two Column: Active Collaborations & Recent Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ActiveCollaborations />
                <RecentMessages />
              </div>
            </div>

            {/* Compact Sidebar - Fixed Width */}
            <div className="w-full xl:w-80 xl:flex-shrink-0">
              <div className="sticky top-8 space-y-4">
                <QuickActions />
                <ProfileCompletion />
                <TrustScore />
                <EscrowStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
