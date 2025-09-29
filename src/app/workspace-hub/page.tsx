import { requireAuth, requireProfile } from "@/lib/auth";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import ClientPageWrapper from "@/components/ui/ClientPageWrapper";

export const dynamic = 'force-dynamic';

export default async function WorkspaceHub() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  return (
    <ClientPageWrapper loadingText="Loading workspace...">
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Global Header */}
        <WorkspaceHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <WorkspaceSidebar profile={profile} />
          
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
                       <div className="flex items-center space-x-2">
                         <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                           <option>Personal Sandbox</option>
                           <option>Shared Workspace</option>
                         </select>
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
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h3>
                         <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                           </svg>
                           <span className="text-sm font-medium">Start New Workspace</span>
                         </button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                           <div className="flex items-center space-x-3 mb-3">
                             <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                               </svg>
                             </div>
                             <div>
                               <h4 className="font-medium text-gray-900 dark:text-white">Personal Sandbox</h4>
                               <p className="text-sm text-gray-600 dark:text-gray-400">Solo projects & AI drafts</p>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-600 dark:text-gray-400">Progress</span>
                               <span className="text-gray-900 dark:text-white">75%</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                               <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">3 AI drafts, 2 active projects</p>
                           </div>
                         </div>
                         
                         <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                           <div className="flex items-center space-x-3 mb-3">
                             <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                               </svg>
                             </div>
                             <div>
                               <h4 className="font-medium text-gray-900 dark:text-white">Shared Project X</h4>
                               <p className="text-sm text-gray-600 dark:text-gray-400">With Bob & Sarah</p>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-600 dark:text-gray-400">Health</span>
                               <span className="text-green-600 dark:text-green-400">Excellent</span>
                             </div>
                             <div className="flex space-x-1">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">5 active collaborations</p>
                           </div>
                         </div>

                         <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                           <div className="flex items-center space-x-3 mb-3">
                             <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                               </svg>
                             </div>
                             <div>
                               <h4 className="font-medium text-gray-900 dark:text-white">Shared Project Y</h4>
                               <p className="text-sm text-gray-600 dark:text-gray-400">With Alice & Mike</p>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-600 dark:text-gray-400">Health</span>
                               <span className="text-yellow-600 dark:text-yellow-400">Good</span>
                             </div>
                             <div className="flex space-x-1">
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                               <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                               <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">3 active collaborations</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Collaboration Feed & Projects */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* Collaboration Feed */}
                       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Feed</h3>
                         <div className="space-y-4">
                           <div className="flex items-start space-x-3">
                             <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                               <span className="text-xs font-medium text-blue-600 dark:text-blue-400">B</span>
                             </div>
                             <div className="flex-1">
                               <p className="text-sm text-gray-900 dark:text-white">
                                 <span className="font-medium">Bob</span> uploaded draft business model
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
                                 AI generated competitor analysis
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
                                 <span className="font-medium">{profile.first_name || 'You'}</span> completed financial projections
                               </p>
                               <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Projects & Tasks Preview */}
                       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
                         <div className="space-y-4">
                           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="font-medium text-gray-900 dark:text-white">Pitch Deck</h4>
                               <span className="text-sm text-gray-600 dark:text-gray-400">70%</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                               <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">AI suggests: polish design before Friday</p>
                           </div>
                           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="font-medium text-gray-900 dark:text-white">Market Research</h4>
                               <span className="text-sm text-orange-600 dark:text-orange-400">Overdue</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                               <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">AI suggests: auto-generate summary</p>
                           </div>
                           <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="font-medium text-gray-900 dark:text-white">Financial Model</h4>
                               <span className="text-sm text-green-600 dark:text-green-400">Complete</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                               <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                             </div>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Ready for investor review</p>
                           </div>
                         </div>
                       </div>
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
                           <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                             <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                               <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                               </svg>
                             </div>
                             <span className="text-sm font-medium text-gray-900 dark:text-white">Invite Co-Founder</span>
                           </button>
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
