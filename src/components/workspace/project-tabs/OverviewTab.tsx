"use client";
import React from "react";
import { Brain, Activity, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

export default function OverviewTab({ completedCount, overdueCount, progressPct, totalTasks, projectId }: {
  completedCount: number;
  overdueCount: number;
  progressPct: number;
  totalTasks: number;
  projectId?: string;
}) {
  const [activities, setActivities] = React.useState<{ id: string; type: string; description: string; actor_name: string | null; created_at: string; }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [modalPage, setModalPage] = React.useState(1);
  const [modalActivities, setModalActivities] = React.useState<{ id: string; type: string; description: string; actor_name: string | null; created_at: string; }[]>([]);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);

  const MODAL_PAGE_SIZE = 10;
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/workspaces/projects/${projectId}/activities?limit=5`, { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled) setActivities(data.activities || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  async function loadModal(page: number) {
    if (!projectId) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/workspaces/projects/${projectId}/activities?page=${page}&limit=${MODAL_PAGE_SIZE}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setModalActivities(data.activities || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setModalLoading(false);
    }
  }

  function openModal() {
    setShowModal(true);
    setModalPage(1);
    void loadModal(1);
  }

  function closeModal() {
    setShowModal(false);
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Project Summary</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            AI summary placeholder. Once connected to GPT, this will reflect recent changes and suggest next steps.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <CalendarDays className="w-4 h-4" /> Updated today
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {loading ? (
              <li>Loading...</li>
            ) : activities.length === 0 ? (
              <li>No recent activity yet.</li>
            ) : (
              activities.map(a => (
                <li key={a.id}>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{a.actor_name || 'Someone'}</span> {a.description}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))
            )}
            {activities.length > 0 && (
              <li className="pt-2">
                <button onClick={openModal} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">View All Activities →</button>
              </li>
            )}
            {completedCount > 0 && <li>{completedCount} task{completedCount>1?'s':''} completed</li>}
            {overdueCount > 0 && <li className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400"><AlertTriangle className="w-4 h-4"/> {overdueCount} overdue task{overdueCount>1?'s':''}</li>}
          </ul>
        </Card>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white">All Activities</h4>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {modalLoading ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                ) : modalActivities.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No activities found.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {modalActivities.map(a => (
                      <li key={a.id}>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{a.actor_name || 'Someone'}</span> {a.description}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => { const p = Math.max(1, modalPage - 1); setModalPage(p); void loadModal(p); }}
                  disabled={modalPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                >Previous</button>
                <span className="text-xs text-gray-600 dark:text-gray-400">Page {modalPage} of {totalPages}</span>
                <button
                  onClick={() => { const p = Math.min(totalPages, modalPage + 1); setModalPage(p); void loadModal(p); }}
                  disabled={modalPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Milestones Timeline</h3>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
            <span>{completedCount}/{totalTasks} completed</span>
            <span>{progressPct}%</span>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Quick Insights</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> {completedCount} done</li>
            <li className="inline-flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/> {overdueCount} overdue</li>
            <li className="inline-flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500"/> Suggest rescheduling tasks due this week</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}


