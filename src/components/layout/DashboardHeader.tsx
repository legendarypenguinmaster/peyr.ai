"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadMessageCount = useCallback(
    async (userId: string) => {
      try {
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", userId)
          .eq("is_read", false);

        if (!error && count !== null) {
          setUnreadMessageCount(count);
        }
      } catch (error) {
        console.error("Error loading unread message count:", error);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      // Load unread message count
      loadUnreadMessageCount(user.id);
    };
    loadUserData();
  }, [supabase, loadUnreadMessageCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;

    const messagesSubscription = supabase
      .channel("header-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          // Reload unread count when new message is received
          loadUnreadMessageCount(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          // Reload unread count when message is marked as read
          loadUnreadMessageCount(userId);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [userId, supabase, loadUnreadMessageCount]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-2">
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
              href="/co-founders"
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

            {/* Messages */}
            <div className="relative">
              <button
                className="p-2 text-gray-700 hover:text-blue-600 cursor-pointer relative"
                onClick={() => router.push("/messages")}
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-700 cursor-pointer hover:text-blue-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href={userId ? `/profile/${userId}` : "/profile"}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Post Project Button */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Post Project</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
