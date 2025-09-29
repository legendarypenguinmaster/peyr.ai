import { requireAuth, requireProfile } from "@/lib/auth";
// import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/layout/DashboardHeader";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import InvitationsViewer from "@/components/workspace/InvitationsViewer";

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
                {workspaces.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">B</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">Bob</span> uploaded a new business model draft in <span className="font-medium text-blue-600 dark:text-blue-400">AI Fitness Marketplace</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              AI generated competitor analysis for <span className="font-medium text-purple-600 dark:text-purple-400">Wellness AI Coach</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              {(profile.first_name || 'Y').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{profile.first_name || 'You'}</span> completed financial projections in <span className="font-medium text-green-600 dark:text-green-400">Personal Sandbox</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}