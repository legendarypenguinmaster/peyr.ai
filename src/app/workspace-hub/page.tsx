import { requireAuth, requireProfile } from "@/lib/auth";
// import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/layout/DashboardHeader";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import InvitationsViewer from "@/components/workspace/InvitationsViewer";
import React from "react";
import RecentActivity from "@/components/workspace/RecentActivity";

export const dynamic = 'force-dynamic';

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

export default async function WorkspaceHub() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  // Fetch user's workspaces
  const supabase = await createClient();
  
  let workspaces: WorkspaceMember[] = [];
  try {
    const { data: workspaceData, error } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        status,
        workspaces (
          id,
          name,
          purpose,
          description,
          ai_features,
          created_at,
          status
        )
      `)
      .eq('user_id', profile.id)
      .eq('status', 'active');

    if (!error && workspaceData) {
      workspaces = workspaceData as unknown as WorkspaceMember[];
    }
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    workspaces = [];
  }

  return (
    <ClientPageWrapper loadingText="Loading workspace hub...">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Global Header */}
        <DashboardHeader />
        
        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {profile.name || profile.first_name || 'there'}!
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Choose a workspace to get started or create a new one
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <InvitationsViewer />
                      <Link href="/workspace-hub/create" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium">Create New Workspace</span>
                      </Link>
                    </div>
                  </div>
                </div>

                 {/* Workspace List with Filter */}
                 <WorkspaceList workspaces={workspaces} profile={profile} />

                {/* Recent Activity */}
                {workspaces.length > 0 && <RecentActivity />}
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}