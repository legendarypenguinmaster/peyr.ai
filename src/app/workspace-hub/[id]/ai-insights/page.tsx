import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AIInsightsPageClient from "./AIInsightsPageClient";

export const dynamic = 'force-dynamic';

interface AIInsightsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AIInsightsPage({ params }: AIInsightsPageProps) {
  await requireAuth();
  const profile = await requireProfile();
  const { id: workspaceId } = await params;

  const supabase = await createClient();

  // Resolve current authenticated user id (more reliable than profile.id)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/workspace-hub');
  }

  // Verify user has access to this workspace
  const { data: workspaceMember } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!workspaceMember) {
    redirect('/workspace-hub');
  }

  // Get workspace details
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, description')
    .eq('id', workspaceId)
    .single();

  if (!workspace) {
    redirect('/workspace-hub');
  }

  // Get workspace members for collaboration insights
  const { data: membersData } = await supabase
    .from('workspace_members')
    .select('role, status, user_id')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  // Get profile data for members
  const memberIds = membersData?.map(m => m.user_id) || [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', memberIds);

  // Combine members with their profiles
  const members = membersData?.map(member => ({
    role: member.role,
    status: member.status,
    profiles: profiles?.find(p => p.id === member.user_id) || { id: member.user_id, full_name: 'Unknown', avatar_url: null }
  })) || [];

  // Get workspace projects for context
  const { data: projects } = await supabase
    .from('workspace_projects')
    .select('id, name, status, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  // Get recent documents for analysis
  const { data: documents } = await supabase
    .from('workspace_documents')
    .select('id, title, type, created_at, updated_at, created_by')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
    .limit(20);

  // Get tasks for milestone tracking
  const { data: tasks } = await supabase
    .from('workspace_tasks')
    .select('id, title, status, due_date, assigned_to, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .order('due_date', { ascending: true });

  return (
    <ClientPageWrapper loadingText="Loading AI insights...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} workspaceName={workspace.name} workspaceId={workspaceId} />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <AIInsightsPageClient
              workspaceId={workspaceId}
              workspaceName={workspace.name}
              workspaceDescription={workspace.description}
              currentUserId={user.id}
              userRole={workspaceMember.role}
              members={members || []}
              projects={projects || []}
              documents={documents || []}
              tasks={tasks || []}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
