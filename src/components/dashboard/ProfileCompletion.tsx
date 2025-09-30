"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileCompletion() {
  const supabase = createClient();

  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState({
    basic: false,
    skills: false,
    portfolio: false,
    identity: false,
    references: false,
  });

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "name, role, location, bio, skills, linkedin_url, github_url"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        const basic = Boolean(profile.name && profile.role);
        const skills = Boolean(
          profile.location &&
            profile.bio &&
            Array.isArray(profile.skills) &&
            profile.skills.length > 0
        );
        const portfolio = Boolean(
          profile.linkedin_url &&
            profile.github_url
        );

        const newChecks = {
          basic,
          skills,
          portfolio,
          identity: false,
          references: false,
        };
        setChecks(newChecks);
        const pct = (basic ? 20 : 0) + (skills ? 20 : 0) + (portfolio ? 20 : 0);
        setProgress(pct);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Completion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete your profile</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Completion Rate</span>
            <span className="font-bold text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Profile Items - Compact */}
        <div className="space-y-2 mb-4">
          {[
            { key: "basic", label: "Basic Information", icon: "👤" },
            { key: "skills", label: "Skills & expertise", icon: "🛠️" },
            { key: "portfolio", label: "Portfolio & experience", icon: "💼" },
            { key: "identity", label: "Identity verification", icon: "✅" },
            { key: "references", label: "References", icon: "👥" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="text-sm">{item.icon}</div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              {checks[item.key as keyof typeof checks] ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
