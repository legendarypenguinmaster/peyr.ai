"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

interface Invitation {
  id: string;
  workspace_id: string;
  status: string;
  created_at: string;
  message?: string | null;
  workspaces?: { name: string } | null;
  invited_by_profile?: { id: string; name: string | null; email: string | null } | null;
}

export default function InvitationsViewer() {
  const [open, setOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspaces/invitations?status=pending');
      const data = await res.json();
      setInvitations(data.invitations || []);
      setCount((data.invitations || []).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load count on mount for badge
    load();
    const onFocus = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus);
    };
  }, [open]);

  const act = async (id: string, action: 'accept' | 'decline') => {
    await fetch('/api/workspaces/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId: id, action })
    });
    // Optimistically update UI
    setInvitations(prev => prev.filter(i => i.id !== id));
    setCount(prev => Math.max(0, prev - 1));
    setOpen(false);
    if (action === 'accept') {
      // Refresh the page to include the new workspace in the list
      router.refresh();
    }
  };

  return (
    <>
      {count === 0 ? null : (
      <button onClick={() => setOpen(true)} className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
        Invitations
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs">
            {count}
          </span>
        )}
      </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Workspace Invitations" maxWidthClassName="max-w-2xl">
        {loading ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading…</div>
        ) : invitations.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">No pending invitations</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {invitations.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{inv.workspaces?.name || 'Workspace'}</div>
                  {inv.invited_by_profile && (
                    <div className="text-xs text-gray-700 dark:text-gray-300">From: {inv.invited_by_profile.name || inv.invited_by_profile.email}</div>
                  )}
                  {inv.message && (
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">“{inv.message}”</div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400">Invited on {new Date(inv.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => act(inv.id, 'decline')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Decline</button>
                  <button onClick={() => act(inv.id, 'accept')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}


