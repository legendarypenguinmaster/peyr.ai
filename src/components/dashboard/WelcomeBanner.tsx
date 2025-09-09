"use client";

import { useAppSelector } from "@/store/hooks";

export default function WelcomeBanner() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-gradient-to-r from-blue-400 to-gray-50 text-white rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-lg mb-6">
            Ready to find your next co-founder or collaborate on exciting
            projects?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Complete Profile Setup
            </button>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
              Browse Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
