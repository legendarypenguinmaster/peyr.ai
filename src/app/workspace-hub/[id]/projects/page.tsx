import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import { createClient } from "@/lib/supabase/server";
import ProjectsDashboard from "@/components/workspace/ProjectsDashboard";

export const dynamic = 'force-dynamic';

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkspaceProjectsPage({ params }: WorkspacePageProps) {
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

  // Fetch workspace projects
  let projects = [];
  try {
    const { data: projectsData, error } = await supabase
      .from('workspace_projects')
      .select(`
        *,
        workspace_tasks (
          id,
          title,
          status,
          assigned_to,
          due_date,
          created_at
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (!error && projectsData) {
      projects = projectsData;
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <ClientPageWrapper loadingText="Loading projects...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} workspaceName={workspaceName} workspaceId={workspaceId} />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <ProjectsDashboard 
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              workspaceData={workspaceData}
              projects={projects}
              profile={profile}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
