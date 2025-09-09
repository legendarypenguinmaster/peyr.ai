"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

export default function Dashboard() {
  const { isSignedIn, signupCompleted } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    if (!signupCompleted) {
      router.push("/auth/select-role");
      return;
    }
  }, [isSignedIn, signupCompleted, router]);

  if (!isSignedIn || !signupCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
