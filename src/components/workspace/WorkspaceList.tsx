"use client";

import { useState } from "react";
import Link from "next/link";
import WorkspaceFilter from "./WorkspaceFilter";

interface Workspace {
  id: string;
  name: string;
  purpose: 'personal' | 'shared';
  description: string | null;
  ai_features: unknown;
  created_at: string;
  status: string;
}

interface WorkspaceMember {
  workspace_id: string;
  role: string;
  status: string;
  workspaces: Workspace;
}

interface Profile {
  name: string | null;
  email: string | null;
  first_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
}

interface WorkspaceListProps {
  workspaces: WorkspaceMember[];
  profile: Profile;
}

type FilterType = "all" | "personal" | "shared";

export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Filter workspaces based on active filter
  const filteredWorkspaces = workspaces.filter((workspaceMember) => {
    const workspace = workspaceMember.workspaces;
    if (!workspace) return false;
    switch (activeFilter) {
      case "personal":
        return workspace.purpose === "personal";
      case "shared":
        return workspace.purpose === "shared";
      default:
        return true; // "all"
    }
  });

  return (
    <>
      {/* Filter */}
      <WorkspaceFilter 
        onFilterChange={setActiveFilter} 
        activeFilter={activeFilter} 
      />

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspaceMember) => {
            const workspace = workspaceMember.workspaces;
            if (!workspace) return null;
            const isPersonal = workspace.purpose === 'personal';
            
            // Get color scheme based on workspace type
            const colorScheme = isPersonal ? {
              bg: 'bg-blue-100 dark:bg-blue-900/20',
              text: 'text-blue-600 dark:text-blue-400',
              border: 'group-hover:border-blue-300 dark:group-hover:border-blue-600',
              progress: 'bg-blue-600'
            } : {
              bg: 'bg-green-100 dark:bg-green-900/20',
              text: 'text-green-600 dark:text-green-400',
              border: 'group-hover:border-green-300 dark:group-hover:border-green-600',
              progress: 'bg-green-600'
            };

            return (
              <Link key={workspace.id} href={`/workspace-hub/${workspace.id}`} className="group">
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 ${colorScheme.border}`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 ${colorScheme.bg} rounded-xl flex items-center justify-center`}>
                      {isPersonal ? (
                        <svg className={`w-6 h-6 ${colorScheme.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      ) : (
                        <svg className={`w-6 h-6 ${colorScheme.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workspace.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isPersonal ? 'Your private workspace' : `Shared workspace • ${workspaceMember.role}`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Type</span>
                      <span className="text-gray-900 dark:text-white capitalize">{workspace.purpose}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <span className="text-gray-900 dark:text-white capitalize">{workspace.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Created</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your Role</span>
                      <span className={`text-sm font-medium ${colorScheme.text} capitalize`}>
                        {workspaceMember.role}
                      </span>
                    </div>
                    {workspace.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeFilter === "all" ? "No workspaces yet" : `No ${activeFilter === "personal" ? "personal" : "shared"} workspaces`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeFilter === "all" 
                ? "Get started by creating your first workspace"
                : `Create a ${activeFilter === "personal" ? "personal" : "shared"} workspace to get started`
              }
            </p>
            <Link href="/workspace-hub/create" className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">
                {activeFilter === "all" ? "Create Your First Workspace" : `Create ${activeFilter === "personal" ? "Personal" : "Shared"} Workspace`}
              </span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
