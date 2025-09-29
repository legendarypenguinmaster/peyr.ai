import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import { createClient } from "@/lib/supabase/server";
import CreateProjectWizard from "@/components/workspace/CreateProjectWizard";

export const dynamic = 'force-dynamic';

interface NewProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  // Await params before accessing its properties
  const { id } = await params;
  const workspaceId = id;

  // Fetch workspace details
  const supabase = await createClient();
  let workspaceName = "Navigation";
  let workspaceData = null;
  
  try {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (!error && workspace) {
      workspaceName = workspace.name;
      workspaceData = workspace;
    }
  } catch (error) {
    console.error('Error fetching workspace:', error);
  }

  // Fetch workspace members for collaboration (two-step to avoid missing FK joins)
  let workspaceMembers: { user_id: string; role: string; profiles: { id: string; name: string | null; email: string | null; avatar_url: string | null } }[] = [];
  try {
    const { data: membersRaw, error: membersError } = await supabase
      .from('workspace_members')
      .select('user_id, role')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');

    if (!membersError && membersRaw) {
      const otherUsers = (membersRaw || []).filter((m: { user_id: string }) => m.user_id !== profile.id);
      const ids = otherUsers.map((m: { user_id: string }) => m.user_id);

      if (ids.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', ids);

        const byId: Record<string, { id: string; name: string | null; email: string | null; avatar_url: string | null }> = {};
        if (!profilesError && profilesData) {
          for (const p of profilesData as { id: string; name: string | null; email: string | null; avatar_url: string | null }[]) byId[p.id] = p;
        }

        workspaceMembers = otherUsers.map((m: { user_id: string; role: string }) => ({
          user_id: m.user_id,
          role: m.role,
          profiles: byId[m.user_id] || { id: m.user_id, name: null, email: null, avatar_url: null },
        }));
      } else {
        workspaceMembers = [];
      }
    }
  } catch (error) {
    console.error('Error fetching workspace members:', error);
  }

  return (
    <ClientPageWrapper loadingText="Loading project creation...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} workspaceName={workspaceName} workspaceId={workspaceId} />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <CreateProjectWizard 
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              workspaceData={workspaceData}
              workspaceMembers={workspaceMembers}
              profile={profile}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
