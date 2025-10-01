import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DocumentsPageClient from "./DocumentsPageClient";

export const dynamic = 'force-dynamic';

interface DocumentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
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

  // Fetch workspace info
  let workspaceName = "Navigation";
  try {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (!error && workspace) {
      workspaceName = workspace.name;
      // workspaceData = workspace; // Unused variable
    }
  } catch (error) {
    console.error('Error fetching workspace:', error);
  }

  // Fetch projects for the workspace
  let projects: { id: string; name: string }[] = [];
  try {
    const { data: projectsData, error } = await supabase
      .from('workspace_projects')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (!error && projectsData) {
      projects = projectsData;
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <ClientPageWrapper loadingText="Loading documents...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} workspaceName={workspaceName} workspaceId={workspaceId} />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <DocumentsPageClient
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              projects={projects}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
