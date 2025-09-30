"use client";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Wand2, Eye, Pencil, Trash2, X, Plus, Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Quote, Code } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

interface NotesTabProps {
  noteDraft: string;
  setNoteDraft: Dispatch<SetStateAction<string>>;
  workspaceId?: string;
  projectId?: string;
}

interface NoteRow { id: string; title: string; content: string; created_at: string; created_by: string | null; }

export default function NotesTab({ noteDraft, setNoteDraft, workspaceId, projectId }: NotesTabProps) {
  void noteDraft; void setNoteDraft;
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(false); void loading;
  const [error, setError] = useState<string | null>(null); void error;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoteRow | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [structuring, setStructuring] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<NoteRow | null>(null);
  const [creatorsMap, setCreatorsMap] = useState<Record<string, { name: string | null; avatar_url: string | null }>>({});
  const [confirmNote, setConfirmNote] = useState<NoteRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!workspaceId || !projectId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('workspace_project_notes')
          .select('id, title, content, created_at, created_by')
          .eq('workspace_id', workspaceId)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        if (!cancelled && !err && data) {
          const rows = data as unknown as NoteRow[];
          setNotes(rows);
          const ids = Array.from(new Set(rows.map(r => r.created_by).filter(Boolean))) as string[];
          if (ids.length > 0) {
            const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', ids);
            const map: Record<string, { name: string | null; avatar_url: string | null }> = {};
            (profs || []).forEach((p: { id: string; name: string | null; avatar_url: string | null }) => { map[p.id] = { name: p.name, avatar_url: p.avatar_url }; });
            setCreatorsMap(map);
          }
        }
      } catch {}
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase, workspaceId, projectId]);

  const openNew = () => { setEditing(null); setTitle(""); setContent(""); setModalOpen(true); };
  const openEdit = (n: NoteRow) => { setEditing(n); setTitle(n.title); setContent(n.content); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const aiStructure = async () => {
    if (!content.trim()) return;
    setStructuring(true);
    try {
      const res = await fetch('/api/ai-tools/notes/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, model: 'gpt-4o-mini' })
      });
      if (res.ok) {
        const data = await res.json();
        const structured: string = data.structured || content;
        const html = markdownToHtml(structured);
        setContent(html);
        if (editorRef.current) editorRef.current.innerHTML = html;
      }
    } finally { setStructuring(false); }
  };

  const saveNote = async () => {
    if (!workspaceId || !projectId) return;
    const html = editorRef.current ? editorRef.current.innerHTML : content;
    if (!title.trim() || !html.trim()) return;
    try {
      setSaving(true);
      const payload = { workspace_id: workspaceId, project_id: projectId, title, content: html };
      if (editing) {
        const { data, error: err } = await supabase.from('workspace_project_notes').update({ title, content: html }).eq('id', editing.id).select('*').single();
        if (!err && data) setNotes(prev => prev.map(n => n.id === editing.id ? { ...n, title, content: html } : n));
      } else {
        const { data, error: err } = await supabase.from('workspace_project_notes').insert(payload).select('id, title, content, created_at, created_by').single();
        if (!err && data) setNotes(prev => [data as unknown as NoteRow, ...prev]);
      }
      closeModal();
    } catch {}
    finally { setSaving(false); }
  };

  const apply = (cmd: string, value?: string) => {
    // ensure editor focused
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    // sync state
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  };

  function markdownToHtml(md: string): string {
    const lines = md.split(/\r?\n/);
    const out: string[] = [];
    let inUl = false;
    const flushUl = () => { if (inUl) { out.push('</ul>'); inUl = false; } };
    const fmtInline = (s: string) => {
      // bold **text**
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // italic _text_ or *text*
      s = s.replace(/_(.+?)_/g, '<em>$1</em>');
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return s;
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushUl(); continue; }
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushUl();
        const level = h[1].length;
        out.push(`<h${level}>${fmtInline(h[2])}</h${level}>`);
        continue;
      }
      const li = line.match(/^[-*]\s+(.*)$/);
      if (li) {
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${fmtInline(li[1])}</li>`);
        continue;
      }
      flushUl();
      out.push(`<p>${fmtInline(line)}</p>`);
    }
    flushUl();
    return out.join('');
  }
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Shared Notes</h3>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
          <Plus className="w-4 h-4"/> Add Note
        </button>
      </div>

      {/* Cards (memo style) */}
      {notes.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-600 dark:text-gray-400">No notes yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n, idx) => (
            <div key={n.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">#{idx + 1}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{n.title}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-4" dangerouslySetInnerHTML={{ __html: n.content }} />
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.created_by && creatorsMap[n.created_by]?.avatar_url ? (
                    <Image src={creatorsMap[n.created_by]!.avatar_url!} alt={creatorsMap[n.created_by]!.name || 'Creator'} width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-[10px] font-medium" aria-hidden>
                      {(creatorsMap[n.created_by || '']?.name || 'U').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">{creatorsMap[n.created_by || '']?.name || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewing(n)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="View"><Eye className="w-4 h-4"/></button>
                  <button onClick={() => openEdit(n)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Edit"><Pencil className="w-4 h-4"/></button>
                  <button onClick={() => setConfirmNote(n)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" title="Delete"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Note' : 'Add Note'}</div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" placeholder="Meeting notes, research idea, ..." />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Content</label>
                {/* Toolbar */}
                <div className="flex items-center gap-1 mb-2">
                  <button type="button" onClick={() => apply('bold')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Bold"><Bold className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('italic')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Italic"><Italic className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('underline')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Underline"><Underline className="w-4 h-4"/></button>
                  <span className="mx-1 w-px h-5 bg-gray-200 dark:bg-gray-700"/>
                  <button type="button" onClick={() => apply('formatBlock', 'H1')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Heading 1"><Heading1 className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('formatBlock', 'H2')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Heading 2"><Heading2 className="w-4 h-4"/></button>
                  <span className="mx-1 w-px h-5 bg-gray-2 00 dark:bg-gray-700"/>
                  <button type="button" onClick={() => apply('insertUnorderedList')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Bulleted List"><List className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('insertOrderedList')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Numbered List"><ListOrdered className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('formatBlock', 'BLOCKQUOTE')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Quote"><Quote className="w-4 h-4"/></button>
                  <button type="button" onClick={() => apply('formatBlock', 'PRE')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Code"><Code className="w-4 h-4"/></button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setContent((e.currentTarget as HTMLDivElement).innerHTML)}
                  className="w-full min-h-40 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
                  dangerouslySetInnerHTML={{ __html: content || '' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <button onClick={aiStructure} disabled={structuring} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60">
                  <Wand2 className="w-4 h-4"/> {structuring ? 'Structuring...' : 'AI Structure'}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={closeModal} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Cancel</button>
                  <button onClick={saveNote} disabled={saving} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{viewing.title}</div>
              <button onClick={() => setViewing(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X className="w-4 h-4"/></button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: viewing.content }} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {viewing.created_by && creatorsMap[viewing.created_by]?.avatar_url ? (
                <Image src={creatorsMap[viewing.created_by]!.avatar_url!} alt={creatorsMap[viewing.created_by]!.name || 'Creator'} width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <span className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-[10px] font-medium" aria-hidden>
                  {(creatorsMap[viewing.created_by || '']?.name || 'U').trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span>{creatorsMap[viewing.created_by || '']?.name || '—'}</span>
              <span>•</span>
              <span>{new Date(viewing.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmNote(null)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Delete note</div>
              <button onClick={() => setConfirmNote(null)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">Are you sure you want to delete &quot;{confirmNote.title}&quot;?</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmNote(null)} className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200">Cancel</button>
              <button disabled={deleting} onClick={async () => {
                try {
                  setDeleting(true);
                  await supabase.from('workspace_project_notes').delete().eq('id', confirmNote.id);
                  setNotes(prev => prev.filter(x => x.id !== confirmNote.id));
                  setConfirmNote(null);
                } finally {
                  setDeleting(false);
                }
              }} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


