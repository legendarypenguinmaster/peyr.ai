"use client";
import { useState, useCallback } from "react";
import InviteUsersModal from "@/components/workspace/InviteUsersModal";
import { createClient } from "@/lib/supabase/client";

interface InviteUsersButtonProps {
  workspaceId: string;
}

export default function InviteUsersButton({ workspaceId }: InviteUsersButtonProps) {
  const [open, setOpen] = useState(false);

  const fetchOptions = useCallback(async (query: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const q = query.trim();
    if (!q) return [];
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .or(`email.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(10);
    const list = (data || []) as { id: string; name: string | null; email: string | null }[];
    if (user) {
      return list.filter(opt => opt.id !== user.id && opt.email !== user.email);
    }
    return list;
  }, []);

  const onInvite = useCallback(async (selectedUserIds: string[], message?: string) => {
    try {
      await fetch('/api/workspaces/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, userIds: selectedUserIds, message })
      });
    } catch {}
  }, [workspaceId]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">Invite Co-Founder</span>
      </button>
      <InviteUsersModal
        open={open}
        onClose={() => setOpen(false)}
        onInvite={onInvite}
        fetchOptions={fetchOptions}
        title="Invite Co-Founders"
      />
    </>
  );
}


