import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import { createClient } from "@/lib/supabase/server";
import ProjectDetail from "../../../../../components/workspace/ProjectDetail";

export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  await requireAuth();
  const profile = await requireProfile();
  const { id: workspaceId, projectId } = await params;

  const supabase = await createClient();

  let workspaceName = "Workspace";
  let project: { id: string; name: string; description?: string | null } | null = null;
  let tasks: { id: string; title: string; description: string | null; status: 'todo' | 'in_progress' | 'review' | 'completed'; priority: string | null; assigned_to: string | null; due_date: string | null; created_at: string; updated_at: string | null; task_id: string | null; task_order: number | null }[] = [];
  let members: { id: string; name: string | null; email: string | null }[] = [];

  try {
    const [{ data: workspaceData }, { data: projectData }, { data: tasksData }] = await Promise.all([
      supabase.from('workspaces').select('name').eq('id', workspaceId).single(),
      supabase.from('workspace_projects').select('*').eq('id', projectId).single(),
      supabase
        .from('workspace_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('task_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
    ]);

    if (workspaceData?.name) workspaceName = workspaceData.name;
    if (projectData) project = projectData;
    if (tasksData) {
      tasks = tasksData.map(t => ({
        ...t,
        status: (['todo','in_progress','review','completed'].includes(t.status) ? t.status : 'todo') as 'todo' | 'in_progress' | 'review' | 'completed',
      }));
    }

    // Members of this workspace (basic list via workspace_members join)
    const { data: membersData } = await supabase
      .from('workspace_members')
      .select('profiles(id, name, email)')
      .eq('workspace_id', workspaceId);

    if (Array.isArray(membersData)) {
      members = (membersData as unknown as { profiles?: { id: string; name: string | null; email: string | null } | null }[]).map((m) => ({
        id: m.profiles?.id || '',
        name: m.profiles?.name || null,
        email: m.profiles?.email || null,
      }));
    }
  } catch (error) {
    console.error('Error loading project detail:', error);
  }

  return (
    <ClientPageWrapper loadingText="Loading project...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        <WorkspaceHeader />
        <div className="flex flex-1 overflow-hidden">
          <WorkspaceSidebar profile={profile} workspaceName={workspaceName} workspaceId={workspaceId} />
          <div className="flex-1 overflow-y-auto p-8">
            <ProjectDetail
              workspaceId={workspaceId}
              projectId={projectId}
              project={project}
              tasks={tasks}
              members={members}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}


