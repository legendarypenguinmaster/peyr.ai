"use client";

import { Circle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileCompletion() {
  const router = useRouter();

  const handleCompleteProfile = () => {
    router.push("/profile-setup");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
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
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Completion
            </h3>
            <p className="text-sm text-gray-600">Complete your profile</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Completion Rate</span>
            <span className="font-bold text-gray-900">0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: "0%" }}
            ></div>
          </div>
        </div>

        {/* Profile Items - Compact */}
        <div className="space-y-2 mb-4">
          {[
            { label: "Basic Information", icon: "👤" },
            { label: "Skills & expertise", icon: "🛠️" },
            { label: "Portfolio & experience", icon: "💼" },
            { label: "Identity verification", icon: "✅" },
            { label: "References", icon: "👥" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
            >
              <div className="text-sm">{item.icon}</div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">
                  {item.label}
                </span>
              </div>
              <Circle className="w-3 h-3 text-gray-300" />
            </div>
          ))}
        </div>

        <button
          onClick={handleCompleteProfile}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold cursor-pointer text-sm"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
}
