"use client";

import React from "react";

interface FeedItem {
  id: string;
  type: string;
  actor_name: string | null;
  invited_user_name?: string | null;
  project_name?: string | null;
  created_at: string;
  description: string;
}

export default function WorkspaceCollaborationFeed({ workspaceId }: { workspaceId: string }) {
  const [items, setItems] = React.useState<FeedItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/activities?limit=3`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load feed');
        const data = await res.json();
        if (!cancelled) setItems(data.activities || []);
      } catch {
        if (!cancelled) setError('Failed to load feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [workspaceId]);

  async function loadModal(p: number) {
    const res = await fetch(`/api/workspaces/${workspaceId}/activities?page=${p}&limit=${PAGE_SIZE}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    setItems(data.activities || []);
    setTotalPages(data.totalPages || 1);
  }

  function openModal() {
    setShowModal(true);
    setPage(1);
    void loadModal(1);
  }
  function closeModal() {
    setShowModal(false);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Feed</h3>
      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map(a => (
            <div key={a.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {a.type === 'project_created' ? 'P' : a.type === 'invitation_accepted' ? 'A' : 'I'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{a.actor_name || 'Someone'}</span> {a.description}{a.project_name ? ` ${a.project_name}` : ''}{a.invited_user_name ? ` (${a.invited_user_name})` : ''}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button onClick={openModal} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">View More →</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">All Collaboration Activity</h4>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {items.map(a => (
                  <div key={a.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {a.type === 'project_created' ? 'P' : a.type === 'invitation_accepted' ? 'A' : 'I'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{a.actor_name || 'Someone'}</span> {a.description}{a.project_name ? ` ${a.project_name}` : ''}{a.invited_user_name ? ` (${a.invited_user_name})` : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => { const newPage = Math.max(1, page - 1); setPage(newPage); void loadModal(newPage); }}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
              >Previous</button>
              <span className="text-xs text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => { const newPage = Math.min(totalPages, page + 1); setPage(newPage); void loadModal(newPage); }}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


