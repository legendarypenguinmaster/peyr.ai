"use client";

import {
  Award,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { FounderData, Profile } from "@/app/profile/types";

export default function FounderProfile({
  founderData,
}: {
  profile: Profile;
  founderData: FounderData;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Me</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {founderData.bio || "No bio provided yet."}
          </p>
        </div>

        {/* Skills & Expertise */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Skills & Expertise
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {founderData.skills?.map((skill: string) => (
              <span
                key={skill}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Industries of Interest
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {founderData.industries?.map((industry: string) => (
              <span
                key={industry}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>

        {/* Co-founder Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Co-founder Preferences
            </h2>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {founderData.cofounder_preference}
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Quick Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {founderData.location}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timezone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {founderData.timezone}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commitment</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {founderData.commitment_level?.replace("-", " ")}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {founderData.availability_hours} hours per week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Style */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Communication
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preferred Style</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {founderData.communication_style?.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Social Links */}
        {(founderData.linkedin_url || founderData.github_url) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social Links
            </h3>
            <div className="space-y-3">
              {founderData.linkedin_url && (
                <a
                  href={founderData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      LinkedIn
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Professional Profile
                    </p>
                  </div>
                </a>
              )}
              {founderData.github_url && (
                <a
                  href={founderData.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                      GitHub
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Code Repository</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
