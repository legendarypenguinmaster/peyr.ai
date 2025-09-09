"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Shield,
  Search,
  Grid3X3,
  Layout,
  Brain,
  Award,
  MessageCircle,
  Bell,
  User,
  Plus,
} from "lucide-react";

export default function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Peyr.ai</h1>
                <p className="text-sm text-gray-600">Dream. Pair. Do.</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              <span>Find Co-Founders</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <Grid3X3 className="w-5 h-5" />
              <span>Browse Projects</span>
            </Link>
            <Link
              href="/workspace"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <Layout className="w-5 h-5" />
              <span>Workspace</span>
            </Link>
            <Link
              href="/ai-tools"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <Brain className="w-5 h-5" />
              <span>AI Tools</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                NEW
              </span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-6">
            <Link
              href="/reputation"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <Award className="w-5 h-5" />
              <span>Reputation</span>
            </Link>

            <Link
              href="/messages"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-700 hover:text-blue-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            {/* Post Project Button */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Post Project</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
