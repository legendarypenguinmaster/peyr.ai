"use client";

import {
  Award,
  Calendar,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Profile } from "@/app/profile/types";

export default function InvestorProfile({ profile }: { profile: Profile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Me</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {profile.bio ||
              "I'm an investor looking to support promising startups and founders. I'm interested in connecting with innovative entrepreneurs who are building the next generation of companies."}
          </p>
        </div>

        {/* Investment Focus */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Investment Focus
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Stage Focus
              </h3>
              <p className="text-gray-700 dark:text-gray-300">Early stage to Series A</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Investment Size
              </h3>
              <p className="text-gray-700 dark:text-gray-300">$10K - $100K</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                Geographic Focus
              </h3>
              <p className="text-gray-700 dark:text-gray-300">Global</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Award className="w-5 h-5 mr-2 text-orange-600" />
                Sector Focus
              </h3>
              <p className="text-gray-700 dark:text-gray-300">Technology, SaaS, Fintech</p>
            </div>
          </div>
        </div>

        {/* Investment Criteria */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Investment Criteria
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-blue-600" />
                What I Look For
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Strong founding team with complementary skills</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Clear market opportunity and product-market fit</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Scalable business model</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Traction and growth metrics</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-green-600" />
                How I Help
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Strategic guidance and mentorship</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Network introductions</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Fundraising support</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Operational expertise</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Message
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <ExternalLink className="w-5 h-5 mr-2" />
              Schedule Meeting
            </button>
          </div>
        </div>

        {/* Investment Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Investment Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Investments</span>
              <span className="font-semibold text-gray-900 dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Portfolio</span>
              <span className="font-semibold text-gray-900 dark:text-white">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Exit Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Check Size</span>
              <span className="font-semibold text-gray-900 dark:text-white">$50K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
