"use client";

import React from "react";

interface ActivityItem {
  id: string;
  type: string;
  actor_name: string | null;
  workspace_name: string | null;
  project_name?: string | null;
  invited_user_name?: string | null;
  created_at: string;
  description: string;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function RecentActivity() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalPage, setModalPage] = React.useState(1);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [modalActivities, setModalActivities] = React.useState<ActivityItem[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);

  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/workspaces/activities?limit=5', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load activities');
        const data = await res.json();
        if (!cancelled) setActivities(data.activities || []);
      } catch {
        if (!cancelled) setError('Failed to load activities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadModalActivities = async (page: number) => {
    setModalLoading(true);
    try {
      const res = await fetch(`/api/workspaces/activities?page=${page}&limit=${ITEMS_PER_PAGE}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load activities');
      const data = await res.json();
      setModalActivities(data.activities || []);
      setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
    } catch (e) {
      console.error('Failed to load modal activities:', e);
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalPage(1);
    loadModalActivities(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalPage(1);
    setModalActivities([]);
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setModalPage(newPage);
      loadModalActivities(newPage);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity yet.</p>
        ) : (
          <>
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {a.type === 'workspace_created' ? 'W' : a.type === 'project_created' ? 'P' : a.type === 'invitation_accepted' ? 'A' : 'I'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {renderActivityText(a)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={openModal}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View All Activities →
              </button>
            </div>
          </>
        )}
      </div>

      <Modal open={showModal} onClose={closeModal}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Activities</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {modalLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
            ) : modalActivities.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No activities found.</p>
            ) : (
              <div className="space-y-4">
                {modalActivities.map(a => (
                  <div key={a.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {a.type === 'workspace_created' ? 'W' : a.type === 'project_created' ? 'P' : a.type === 'invitation_accepted' ? 'A' : 'I'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {renderActivityText(a)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => changePage(modalPage - 1)}
                disabled={modalPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {modalPage} of {totalPages}
              </span>
              <button
                onClick={() => changePage(modalPage + 1)}
                disabled={modalPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function renderActivityText(a: ActivityItem) {
  const actor = a.actor_name || 'Someone';
  if (a.type === 'workspace_created') {
    return <span><span className="font-medium">{actor}</span> created workspace <span className="font-medium text-blue-600 dark:text-blue-400">{a.workspace_name || ''}</span></span>;
  }
  if (a.type === 'project_created') {
    return <span><span className="font-medium">{actor}</span> created project <span className="font-medium text-purple-600 dark:text-purple-400">{a.project_name || ''}</span> in <span className="font-medium">{a.workspace_name || ''}</span></span>;
  }
  if (a.type === 'invitation_accepted') {
    return <span><span className="font-medium">{a.invited_user_name || 'A user'}</span> accepted an invite to <span className="font-medium">{a.workspace_name || ''}</span></span>;
  }
  return <span><span className="font-medium">{actor}</span> sent an invite to <span className="font-medium">{a.invited_user_name || 'a user'}</span> for <span className="font-medium">{a.workspace_name || ''}</span></span>;
}


