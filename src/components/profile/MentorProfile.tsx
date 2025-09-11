"use client";

import {
  Award,
  Calendar,
  Clock,
  Github,
  Linkedin,
  MapPin,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { MentorData, Profile } from "@/app/profile/types";

export default function MentorProfile({
  profile,
  mentorData,
}: {
  profile: Profile;
  mentorData: MentorData;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            {mentorData.bio || "No bio provided yet."}
          </p>

          {/* Location and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">
                  {mentorData.location || profile.location || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium text-gray-900">
                  {mentorData.timezone || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Domains */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Areas of Expertise
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {mentorData.expertise_domains?.map((expertise: string) => (
              <span
                key={expertise}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                {expertise}
              </span>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Industries</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {mentorData.industries?.map((industry: string) => (
              <span
                key={industry}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-teal-50 text-green-700 border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>

        {/* Past Roles */}
        {mentorData.past_roles && mentorData.past_roles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Past Roles</h2>
            </div>
            <div className="space-y-4">
              {mentorData.past_roles.map((role: string) => (
                <div
                  key={role}
                  className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200"
                >
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-4"></div>
                  <span className="text-gray-700 font-medium">{role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Quick Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium text-gray-900">
                  {mentorData.years_experience} years
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="font-medium text-gray-900">
                  {mentorData.availability_hours} hours per week
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Preferred Channel</p>
                <p className="font-medium text-gray-900 capitalize">
                  {mentorData.communication_channel?.replace("-", " ") ||
                    "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Mentorship Style</p>
                <p className="font-medium text-gray-900 capitalize">
                  {mentorData.mentorship_style?.replace("-", " ") ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Mentorship */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mentorship Details
          </h3>
          <div
            className={`rounded-xl p-4 border ${
              mentorData.is_paid
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  mentorData.is_paid ? "bg-green-500" : "bg-blue-500"
                }`}
              ></div>
              <div>
                <p className="font-medium text-gray-900">
                  {mentorData.is_paid ? "Paid Mentorship" : "Free Mentorship"}
                </p>
                <p className="text-sm text-gray-600">
                  {mentorData.is_paid
                    ? "Professional mentoring services"
                    : "Community-driven mentorship"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(mentorData.linkedin_url || mentorData.github_url) && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Social Links
            </h3>
            <div className="space-y-3">
              {mentorData.linkedin_url && (
                <a
                  href={mentorData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-700 transition-colors">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">LinkedIn</p>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                      {mentorData.linkedin_url}
                    </p>
                  </div>
                </a>
              )}
              {mentorData.github_url && (
                <a
                  href={mentorData.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-900 transition-colors">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">GitHub</p>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                      {mentorData.github_url}
                    </p>
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
