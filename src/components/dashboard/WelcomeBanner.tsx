"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function WelcomeBanner() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const handleCompleteProfile = () => {
    router.push("/profile-setup");
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Try to get the name from the profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          if (profile?.name) {
            setUserName(profile.name);
          } else {
            // Fallback to email if no name is set
            setUserName(user.email?.split("@")[0] || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [supabase]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
      </div>

      <div className="relative px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Welcome back, {loading ? "..." : userName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to find your next co-founder or collaborate on exciting
                  projects?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleCompleteProfile}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Complete Profile Setup</span>
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Browse Matches</span>
              </button>
            </div>
          </div>

          {/* Decorative Illustration - bottom right */}
          <div className="hidden lg:block absolute right-1 pointer-events-none select-none">
            <div className="relative">
              <img
                src="/images/welcome-bot.png"
                alt="Welcome Bot"
                className="w-70 h-70 object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
