"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

interface UserOption { id: string; name: string | null; email: string | null }

interface InviteUsersModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (selectedUserIds: string[], message?: string) => Promise<void> | void;
  fetchOptions: (query: string) => Promise<UserOption[]>;
  title?: string;
}

export default function InviteUsersModal({ open, onClose, onInvite, fetchOptions, title }: InviteUsersModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<Record<string, UserOption>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetchOptions(query.trim());
        if (active) setOptions(res);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [query, fetchOptions]);

  const selectedIds = useMemo(() => Object.keys(selected), [selected]);

  const toggleSelect = (opt: UserOption) => {
    setSelected(prev => {
      const next = { ...prev } as Record<string, UserOption>;
      if (next[opt.id]) delete next[opt.id]; else next[opt.id] = opt;
      return next;
    });
  };

  const invite = async () => {
    setSubmitting(true);
    try {
      await onInvite(selectedIds, message.trim() || undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title || "Invite Users"} maxWidthClassName="max-w-2xl">
      <div className="space-y-4">
        {/* Search / Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search by name or email</label>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {query.trim() && (
              <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                {loading ? (
                  <div className="p-3 text-xs text-gray-600 dark:text-gray-400">Searching…</div>
                ) : options.filter(o => !selected[o.id]).length === 0 ? (
                  <div className="p-3 text-xs text-gray-600 dark:text-gray-400">No results</div>
                ) : (
                  options
                    .filter(o => !selected[o.id])
                    .map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleSelect(opt)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{opt.name || opt.email || 'Unknown'}</div>
                        {opt.email && <div className="text-xs text-gray-600 dark:text-gray-400">{opt.email}</div>}
                      </button>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected list (chips rendered below) */}

        {/* Selected Pills */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map(id => (
              <span key={id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {selected[id].name || selected[id].email}
                <button onClick={() => toggleSelect(selected[id])} className="text-blue-600 dark:text-blue-300">×</button>
              </span>
            ))}
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a short note..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Cancel</button>
          <button onClick={invite} disabled={selectedIds.length === 0 || submitting} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Inviting…' : `Invite (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
}


