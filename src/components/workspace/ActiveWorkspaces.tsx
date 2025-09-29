"use client";

import React from "react";
import Link from "next/link";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  purpose: string;
  role: string;
  member_count: number;
  project_count: number;
  created_at: string;
}

export default function ActiveWorkspaces() {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAll, setShowAll] = React.useState(false);
  const [allWorkspaces, setAllWorkspaces] = React.useState<Workspace[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const ITEMS_PER_PAGE = 6;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/workspaces', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load workspaces');
        const data = await res.json();
        if (!cancelled) {
          const sortedWorkspaces = (data.workspaces || []).sort((a: Workspace, b: Workspace) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAllWorkspaces(sortedWorkspaces);
          setWorkspaces(sortedWorkspaces.slice(0, 3));
          setTotalPages(Math.ceil(sortedWorkspaces.length / ITEMS_PER_PAGE));
        }
      } catch {
        if (!cancelled) setError('Failed to load workspaces');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadPage = async (page: number) => {
    setLoadingMore(true);
    try {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setWorkspaces(allWorkspaces.slice(startIndex, endIndex));
      setCurrentPage(page);
    } finally {
      setLoadingMore(false);
    }
  };

  const showAllWorkspaces = () => {
    setShowAll(true);
    setCurrentPage(1);
    loadPage(1);
  };

  const showLatestOnly = () => {
    setShowAll(false);
    setWorkspaces(allWorkspaces.slice(0, 3));
  };

  function getWorkspaceIcon(purpose: string) {
    if (purpose === 'personal') {
      return (
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }

  function getWorkspaceBgColor(purpose: string) {
    return purpose === 'personal' 
      ? 'bg-blue-100 dark:bg-blue-900/20' 
      : 'bg-green-100 dark:bg-green-900/20';
  }

  function getRoleBadge(role: string) {
    if (role === 'owner') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Owner</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Member</span>;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h3>
          <div className="flex items-center space-x-3">
            <Link href="/workspace-hub/create" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Start New Workspace</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="animate-pulse">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h3>
          <div className="flex items-center space-x-3">
            <Link href="/workspace-hub/create" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Start New Workspace</span>
            </Link>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h3>
        <div className="flex items-center space-x-3">
          {!showAll && allWorkspaces.length > 3 && (
            <button 
              onClick={showAllWorkspaces}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All ({allWorkspaces.length})
            </button>
          )}
          {showAll && (
            <button 
              onClick={showLatestOnly}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              Show Latest Only
            </button>
          )}
          <Link href="/workspace-hub/create" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Start New Workspace</span>
          </Link>
        </div>
      </div>
      
      {workspaces.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workspaces yet</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first workspace to get started</p>
          <Link href="/workspace-hub/create" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Create Workspace</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Link 
              key={workspace.id} 
              href={`/workspace-hub/${workspace.id}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer block"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 ${getWorkspaceBgColor(workspace.purpose)} rounded-lg flex items-center justify-center`}>
                  {getWorkspaceIcon(workspace.purpose)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{workspace.name}</h4>
                    {getRoleBadge(workspace.role)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workspace.purpose === 'personal' ? 'Personal workspace' : `${workspace.member_count} member${workspace.member_count !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Projects</span>
                  <span className="text-gray-900 dark:text-white">{workspace.project_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="text-gray-900 dark:text-white capitalize">{workspace.purpose}</span>
                </div>
                {workspace.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{workspace.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {showAll && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadPage(currentPage - 1)}
              disabled={currentPage === 1 || loadingMore}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => loadPage(currentPage + 1)}
              disabled={currentPage === totalPages || loadingMore}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          {loadingMore && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
