import { Target, FileText, Users, BarChart3 } from "lucide-react";

interface Member {
  role: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

interface MetricsOverviewProps {
  members: Member[];
  projects: Project[];
  documents: Document[];
  tasks: Task[];
}

export default function MetricsOverview({ members, projects, documents, tasks }: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}% complete
            </p>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Task Completion</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Milestone progress tracking</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {documents.filter(d => new Date(d.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
            </p>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Documents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Workspace documentation</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {members.filter(m => m.role === 'owner' || m.role === 'admin').length} admin{members.filter(m => m.role === 'owner' || m.role === 'admin').length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Team Members</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Collaboration insights</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {projects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {projects.filter(p => p.status === 'completed').length} completed
            </p>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Active Projects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Execution pipeline</p>
      </div>
    </div>
  );
}
