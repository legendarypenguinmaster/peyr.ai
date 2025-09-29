"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import {
  Search,
  Grid3X3,
  Layout,
  Brain,
  Award,
  MessageCircle,
  Bell,
  User,
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
  const aiToolsRef = useRef<HTMLDivElement>(null);
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(false);

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
      if (
        aiToolsRef.current &&
        !aiToolsRef.current.contains(event.target as Node)
      ) {
        setIsAiToolsOpen(false);
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
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Peyr.ai" width={100} height={40} className="mr-3 rounded-lg dark:invert dark:brightness-125 transition" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/co-founders"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              <span>Find Co-Founders</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              <Grid3X3 className="w-5 h-5" />
              <span>Browse Projects</span>
            </Link>
            <Link
              href="/workspace-hub"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              <Layout className="w-5 h-5" />
              <span>Workspace</span>
            </Link>
            {/* AI Tools with dropdown */}
            <div className="relative" ref={aiToolsRef}>
              <button
                onClick={() => setIsAiToolsOpen(!isAiToolsOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap cursor-pointer"
              >
                <Brain className="w-5 h-5" />
                <span>AI Tools</span>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  NEW
                </span>
              </button>
              {isAiToolsOpen && (
                <div className="absolute left-0 mt-2 w-[520px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { slug: "ai-coach", name: "AI Startup Coach" },
                      { slug: "pitch-generator", name: "AI Pitch Generator" },
                      { slug: "equity-calculator", name: "AI Equity Calculator" },
                      { slug: "legal-generator", name: "AI Legal Generator" },
                      { slug: "risk-assessment", name: "AI Risk Assessment" },
                      { slug: "compatibility-analysis", name: "AI Compatibility Analysis" },
                      { slug: "ai-diagram-generator", name: "AI Diagram Generator" },
                      { slug: "investor-matching", name: "AI Investor Matching" },
                      { slug: "market-validation", name: "AI Market Validation" },
                      { slug: "team-builder", name: "AI Team Builder" },
                      { slug: "financial-modeling", name: "AI Financial Modeling" },
                      { slug: "product-strategy", name: "AI Product Strategy" },
                      { slug: "competitor-intel", name: "AI Competitor Intel" },
                      { slug: "partnership-discovery", name: "AI Partnership Discovery" },
                      { slug: "performance-optimizer", name: "AI Performance Optimizer" },
                      { slug: "global-expansion", name: "AI Global Expansion" },
                    ].map((t) => (
                      <Link
                        key={t.slug}
                        href={`/ai-tools/${t.slug}`}
                        className="px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsAiToolsOpen(false)}
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href="/ai-tools"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setIsAiToolsOpen(false)}
                    >
                      View all AI Tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-6">
            <Link
              href="/reputation"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              <Award className="w-5 h-5" />
              <span>Reputation</span>
            </Link>

            {/* Theme Switch */}
            <ThemeSwitch />

            {/* Messages */}
            <div className="relative">
              <button
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer relative"
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
              <button className="p-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 relative">
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
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <Link
                    href={userId ? `/profile/${userId}` : "/profile"}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
