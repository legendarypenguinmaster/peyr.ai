import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import CreateWorkspaceForm from "@/components/workspace/CreateWorkspaceForm";

export const dynamic = 'force-dynamic';

export default async function CreateWorkspacePage() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  return (
    <ClientPageWrapper loadingText="Loading workspace creation...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} />
          
          {/* Main Content Area */}
          <div className="flex-1 lg:ml-64 overflow-y-auto">
            <div className="p-10 h-full">
              <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Workspace
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Set up a new workspace for your projects and collaborations
                  </p>
                </div>

                {/* Create Workspace Form */}
                <CreateWorkspaceForm profile={profile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
