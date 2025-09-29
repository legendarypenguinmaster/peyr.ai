"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FolderOpen, 
  FileText, 
  Brain, 
  Shield, 
  Users, 
  Store,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ArrowLeft
} from "lucide-react";

const getNavigationItems = (workspaceId?: string) => [
  {
    name: "Home",
    href: workspaceId ? `/workspace-hub/${workspaceId}` : "/workspace-hub",
    icon: Home,
    description: "Main dashboard view"
  },
  {
    name: "Projects",
    href: workspaceId ? `/workspace-hub/${workspaceId}/projects` : "/workspace-hub/projects",
    icon: FolderOpen,
    description: "Personal + shared projects"
  },
  {
    name: "Documents",
    href: workspaceId ? `/workspace-hub/${workspaceId}/documents` : "/workspace-hub/documents",
    icon: FileText,
    description: "Files, notes, AI drafts, contracts"
  },
  {
    name: "AI Insights",
    href: workspaceId ? `/workspace-hub/${workspaceId}/ai-insights` : "/workspace-hub/ai-insights",
    icon: Brain,
    description: "AI roadmaps, recommendations, snapshots"
  },
  {
    name: "Trust Ledger",
    href: workspaceId ? `/workspace-hub/${workspaceId}/trust-ledger` : "/workspace-hub/trust-ledger",
    icon: Shield,
    description: "Credibility log & contributions"
  },
  {
    name: "Investors",
    href: workspaceId ? `/workspace-hub/${workspaceId}/investors` : "/workspace-hub/investors",
    icon: Users,
    description: "Discovery & connection with founders"
  },
  {
    name: "Marketplace",
    href: workspaceId ? `/workspace-hub/${workspaceId}/marketplace` : "/workspace-hub/marketplace",
    icon: Store,
    description: "Add-ons, hiring, integrations",
    comingSoon: true
  }
];

interface WorkspaceSidebarProps {
  profile: {
    name: string | null;
    email: string | null;
    first_name?: string | null;
    role?: string | null;
    avatar_url?: string | null;
  };
  workspaceName?: string;
  workspaceId?: string;
}

export default function WorkspaceSidebar({ profile, workspaceName, workspaceId }: WorkspaceSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  
  const navigationItems = getNavigationItems(workspaceId);

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out h-full
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'}
        lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {workspaceName || "Navigation"}
              </h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 mr-3
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }
                  `} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.comingSoon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Soon
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                      {item.comingSoon && (
                        <div className="text-xs text-gray-300 mt-1">
                          Coming Soon
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex flex-col items-center space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="User menu"
              >
                {/* Large Profile Image */}
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-medium text-white">
                      {(profile.name || profile.first_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-center space-y-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.name || profile.first_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profile.email || 'No email'}
                    </p>
                    {profile.role && (
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
                        {profile.role}
                      </p>
                    )}
                    
                    {/* Back to Dashboard Button */}
                    <Link
                      href="/workspace-hub"
                      className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to List</span>
                    </Link>
                    
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mt-1" />
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && !isCollapsed && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </Link>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-20 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </>
  );
}
