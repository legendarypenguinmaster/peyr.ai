import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";
import InviteUsersButton from "@/components/workspace/InviteUsersButton";
import WorkspaceCollaborationFeed from "@/components/workspace/WorkspaceCollaborationFeed";
import RecentProjects from "@/components/workspace/RecentProjects";
import ActiveWorkspaces from "@/components/workspace/ActiveWorkspaces";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
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
  
  try {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', workspaceId)
      .single();

    if (!error && workspace) {
      workspaceName = workspace.name;
    }
  } catch (error) {
    console.error('Error fetching workspace:', error);
  }

  return (
    <ClientPageWrapper loadingText="Loading workspace...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} workspaceName={workspaceName} workspaceId={workspaceId} />
          
           {/* Main Content Area */}
           <div className="flex-1 overflow-y-auto">
             <div className="p-10 h-full">
               <div className="h-full">
                 {/* Welcome & Quick Status Bar */}
                 <div className="mb-8">
                   <div className="flex items-center justify-between">
                     <div>
                         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                           Hi {profile.name || profile.first_name || 'there'}, here&apos;s today&apos;s snapshot
                         </h1>
                       <p className="text-gray-600 dark:text-gray-400 mt-1">
                         Your central command center for projects, documents, and AI insights
                       </p>
                     </div>
                     <div className="flex items-center space-x-4">
                       <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* AI Snapshot Panel */}
                 <div className="mb-8">
                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-4">
                           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                             </svg>
                           </div>
                           <div>
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Daily Briefing</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400">Powered by GPT-4o</p>
                           </div>
                         </div>
                         <div className="space-y-3">
                           <p className="text-gray-700 dark:text-gray-300">
                             {profile.first_name || 'You'} and Bob completed 2 milestones yesterday. Trust Score +2%. Next suggested step: finalize pitch deck draft.
                           </p>
                           <div className="flex flex-wrap gap-2">
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                               ✓ 2 milestones completed
                             </span>
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                               📈 Trust Score +2%
                             </span>
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                               🎯 Pitch deck draft
                             </span>
                           </div>
                         </div>
                       </div>
                       <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                         Ask AI
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Main Dashboard Layout */}
                 <div className="flex gap-6 mb-8">
                   {/* Left Content Area */}
                   <div className="flex-1 space-y-6">
                     {/* Active Workspaces Overview */}
                     <ActiveWorkspaces />

                     {/* Collaboration Feed & Projects */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Collaboration Feed */}
                      <WorkspaceCollaborationFeed workspaceId={workspaceId} />

                       {/* Recent Projects */}
                       <RecentProjects workspaceId={workspaceId} />
                     </div>
                   </div>

                   {/* Right Sidebar */}
                   <div className="w-80 flex-shrink-0">
                     <div className="space-y-6">
                       {/* Trust Ledger Snapshot */}
                       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trust Ledger</h3>
                         <div className="text-center mb-4">
                           <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">72</div>
                           <div className="text-sm text-gray-600 dark:text-gray-400">Trust Score</div>
                           <div className="text-xs text-green-600 dark:text-green-400">+3 this week</div>
                         </div>
                         <div className="space-y-3">
                           <div className="flex items-center space-x-3 text-sm">
                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                             <span className="text-gray-700 dark:text-gray-300">Delivered milestone → +5</span>
                           </div>
                           <div className="flex items-center space-x-3 text-sm">
                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                             <span className="text-gray-700 dark:text-gray-300">AI collaboration → +2</span>
                           </div>
                           <div className="flex items-center space-x-3 text-sm">
                             <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                             <span className="text-gray-700 dark:text-gray-300">Peer review → +1</span>
                           </div>
                         </div>
                         <button className="w-full mt-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors">
                           See full Trust Ledger
                         </button>
                       </div>

                       {/* Quick Actions */}
                       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                         <div className="space-y-3">
                           <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                             <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                               </svg>
                             </div>
                             <span className="text-sm font-medium text-gray-900 dark:text-white">Create Project</span>
                           </button>
                           <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                             <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                               </svg>
                             </div>
                             <span className="text-sm font-medium text-gray-900 dark:text-white">Start Workspace</span>
                           </button>
                          <InviteUsersButton workspaceId={workspaceId} />
                           <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                             <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                               </svg>
                             </div>
                             <span className="text-sm font-medium text-gray-900 dark:text-white">Upload Document</span>
                           </button>
                           <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                             <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                               </svg>
                             </div>
                             <span className="text-sm font-medium text-gray-900 dark:text-white">Generate AI Insight</span>
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

               </div>
             </div>
           </div>
         </div>
       </div>
     </ClientPageWrapper>
   );
 }
