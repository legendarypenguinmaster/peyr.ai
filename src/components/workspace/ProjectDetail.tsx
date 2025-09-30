"use client";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import OverviewTab from "@/components/workspace/project-tabs/OverviewTab";
import TasksTab from "@/components/workspace/project-tabs/TasksTab";
import FilesTab from "@/components/workspace/project-tabs/FilesTab";
import NotesTab from "@/components/workspace/project-tabs/NotesTab";
import AiInsightsTab from "@/components/workspace/project-tabs/AiInsightsTab";
import TrustTab from "@/components/workspace/project-tabs/TrustTab";

interface Member { id: string; name: string | null; email: string | null }
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  assigned_to: string | null;
  due_date: string | null;
}

interface ProjectDetailProps {
  workspaceId: string;
  projectId: string;
  project: { id?: string; name?: string; description?: string | null } | null;
  tasks: Task[];
  members: Member[];
}

type TabKey = "overview" | "tasks" | "files" | "notes" | "ai" | "trust";

export default function ProjectDetail({ workspaceId, projectId, project, tasks, members }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>();
  const [noteDraft, setNoteDraft] = useState("");
  // Sync tab with URL hash (#overview, #tasks, ...)
  useEffect(() => {
    const applyHash = () => {
      const hash = (typeof window !== 'undefined' && window.location.hash ? window.location.hash.substring(1) : '').toLowerCase();
      const allowed: TabKey[] = ['overview','tasks','files','notes','ai','trust'];
      if (hash && (allowed as string[]).includes(hash)) setActiveTab(hash as TabKey);
    };
    applyHash();
    const onHashChange = () => applyHash();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', onHashChange);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = window.location.hash.substring(1);
      if (current !== activeTab) {
        history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  const taskColumns = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed'),
  }), [tasks]);

  const totalTasks = tasks.length;
  const completedCount = taskColumns.completed.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project?.name || "Project"}</h1>
          {project?.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Ask AI
          </button>
          <div className="flex -space-x-2">
            {members.slice(0,5).map(m => (
              <div key={m.id} title={m.name || m.email || ''} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200 border border-white dark:border-gray-800">
                {(m.name || m.email || '?').charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="ml-2 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs">
            <ShieldCheck className="w-4 h-4" /> Trust +5
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-2">
        <TabButton idKey="overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton idKey="tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} label="Tasks" />
        <TabButton idKey="files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} label="Files" />
        <TabButton idKey="notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} label="Notes" />
        <TabButton idKey="ai" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Insights" />
        <TabButton idKey="trust" active={activeTab === 'trust'} onClick={() => setActiveTab('trust')} label="Trust Ledger" />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          completedCount={completedCount}
          overdueCount={overdueCount}
          progressPct={progressPct}
          totalTasks={totalTasks}
          projectId={projectId}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksTab
          columns={taskColumns}
          projectName={project?.name || 'Project'}
          members={members}
          allTasks={tasks}
          workspaceId={workspaceId}
          projectId={projectId}
        />
      )}

      {activeTab === 'files' && (
        <FilesTab workspaceId={workspaceId} projectId={projectId} />
      )}

      {activeTab === 'notes' && (
        <NotesTab noteDraft={noteDraft} setNoteDraft={setNoteDraft} workspaceId={workspaceId} projectId={projectId} />
      )}

      {activeTab === 'ai' && (
        <AiInsightsTab progressPct={progressPct} overdueCount={overdueCount} workspaceId={workspaceId} projectId={projectId} />
      )}

      {activeTab === 'trust' && (
        <TrustTab />
      )}
    </div>
  );
}

function TabButton({ idKey, active, onClick, label }: { idKey: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <a
      href={`#${idKey}`}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors ${
        active ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {label}
    </a>
  );
}

// Lightweight shared UI moved into per-tab components


