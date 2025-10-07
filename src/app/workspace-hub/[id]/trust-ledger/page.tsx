import { requireAuth, requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import TrustLedgerPageClient from "./TrustLedgerPageClient";

interface TrustLedgerPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrustLedgerPage({
  params,
}: TrustLedgerPageProps) {
  await requireAuth();
  const profile = await requireProfile();
  const { id: workspaceId } = await params;

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is a member of this workspace
  const { data: workspaceMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!workspaceMember) {
    redirect("/workspace-hub");
  }

  // Get workspace details
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, description")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    redirect("/workspace-hub");
  }

  // Get workspace members
  const { data: members } = await supabase
    .from("workspace_members")
    .select(
      `
      role,
      status,
      user_id,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  // Get workspace projects
  const { data: projects } = await supabase
    .from("workspace_projects")
    .select("id, name, status, created_at, updated_at")
    .eq("workspace_id", workspaceId);

  // Get workspace tasks
  const { data: tasks } = await supabase
    .from("workspace_tasks")
    .select("id, title, status, due_date, assigned_to, created_at, updated_at")
    .eq("workspace_id", workspaceId);

  // Get workspace documents
  const { data: documents } = await supabase
    .from("workspace_documents")
    .select("id, title, type, created_at, updated_at, created_by")
    .eq("workspace_id", workspaceId);

  return (
    <ClientPageWrapper loadingText="Loading trust ledger...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar
            profile={profile}
            workspaceName={workspace.name}
            workspaceId={workspaceId}
          />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <TrustLedgerPageClient
              workspaceId={workspaceId}
              workspaceName={workspace.name}
              workspaceDescription={workspace.description}
              currentUserId={user.id}
              userRole={workspaceMember.role}
              members={(members || []).map((m) => {
                const profile = Array.isArray(m.profiles)
                  ? m.profiles[0]
                  : m.profiles;
                return {
                  role: m.role as string,
                  status: m.status as string,
                  user_id: m.user_id as string,
                  profiles: {
                    id: profile.id as string,
                    full_name: profile.full_name as string,
                    avatar_url: profile.avatar_url as string | undefined,
                  },
                };
              })}
              projects={projects || []}
              tasks={tasks || []}
              documents={documents || []}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
