"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FileText, Upload, Image as ImageIcon, Video, Music, File, FileCode, FileSpreadsheet, FileArchive, Download, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

interface FilesTabProps {
  workspaceId?: string;
  projectId?: string;
}

interface StoredFileItem {
  name: string;
  path: string;
  type: string;
  url: string | null;
  uploadedAt?: string;
  sizeBytes?: number | null;
  uploaderName?: string | null;
  uploaderAvatarUrl?: string | null;
  uploaderId?: string | null;
}

export default function FilesTab({ workspaceId, projectId }: FilesTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const [files, setFiles] = useState<StoredFileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetFile, setTargetFile] = useState<StoredFileItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploaderMap, setUploaderMap] = useState<Record<string, string>>({});

  const prefix = useMemo(() => {
    const w = workspaceId || "unknown";
    const p = projectId || "misc";
    return `${w}/${p}`;
  }, [workspaceId, projectId]);

  const listFiles = useCallback(async () => {
    try {
      setError(null);
      // const allFiles: StoredFileItem[] = []; // Unused variable

      // 1. Fetch from project_files bucket and project_files_meta
      const { data: projectFilesData, error: projectFilesErr } = await supabase.storage.from("project_files").list(prefix, { search: "", limit: 100, offset: 0 });
      if (projectFilesErr) throw projectFilesErr;

      const projectEntries = (projectFilesData || []).filter(Boolean);
      const projectFullPaths = projectEntries.map((it) => `${prefix}/${it.name}`);

      // Get metadata for project files
      type MetaRow = { path: string; uploader_id: string | null; size_bytes: number | null; created_at: string };
      let projectMetaRows: MetaRow[] | null = null;
      try {
        const { data: rows } = await supabase
          .from('project_files_meta')
          .select('path, uploader_id, size_bytes, created_at')
          .in('path', projectFullPaths);
        projectMetaRows = rows || null;
      } catch {}

      // 2. Fetch from workspace_documents table (for document-like files)
      let workspaceDocs: Array<{
        id: string;
        title: string;
        file_url: string;
        created_by: string;
        created_at: string;
        updated_at: string;
        project_id: string | null;
        type: string;
        size_bytes: number | null;
      }> = [];
      try {
        const { data: docs } = await supabase
          .from('workspace_documents')
          .select('id, title, file_url, created_by, created_at, updated_at, project_id, type, size_bytes')
          .eq('workspace_id', workspaceId)
          .eq('project_id', projectId);
        workspaceDocs = docs || [];
      } catch {}

      // 3. Get metadata for workspace documents
      let workspaceMetaRows: MetaRow[] | null = null;
      try {
        const docPaths = workspaceDocs.map(doc => {
          // Extract path from file_url or construct it
          if (doc.file_url) {
            const urlParts = doc.file_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            return `${workspaceId}/documents/${fileName}`;
          }
          return null;
        }).filter(Boolean);
        
        if (docPaths.length > 0) {
          const { data: rows } = await supabase
            .from('workspace_documents')
            .select('path, uploader_id, size_bytes, created_at')
            .in('path', docPaths);
          workspaceMetaRows = rows || null;
        }
      } catch {}

      // 4. Resolve uploader names via profiles
      const profilesMap: Record<string, { name: string | null; email: string | null; avatar_url: string | null }> = {};
      try {
        const allUploaderIds = [
          ...(projectMetaRows || []).map(r => r.uploader_id),
          ...(workspaceDocs || []).map(d => d.created_by),
          ...(workspaceMetaRows || []).map(r => r.uploader_id)
        ].filter(Boolean);
        
        const uniqueUploaderIds = Array.from(new Set(allUploaderIds)) as string[];
        if (uniqueUploaderIds.length > 0) {
          const { data: profs } = await supabase.from('profiles').select('id, name, email, avatar_url').in('id', uniqueUploaderIds);
          (profs || []).forEach((p: { id: string; name: string | null; email: string | null; avatar_url: string | null }) => { 
            profilesMap[p.id] = { name: p.name, email: p.email, avatar_url: p.avatar_url }; 
          });
        }
      } catch {}

      // 5. Process project files
      const projectItems: StoredFileItem[] = projectEntries.map((it) => {
        const fullPath = `${prefix}/${it.name}`;
        const { data: pub } = supabase.storage.from("project_files").getPublicUrl(fullPath);
        const meta = (projectMetaRows || []).find(r => r.path === fullPath);
        const dispName = meta?.uploader_id ? (profilesMap[meta.uploader_id]?.name || profilesMap[meta.uploader_id]?.email || null) : (uploaderMap[fullPath] ?? null);
        const avatar = meta?.uploader_id ? (profilesMap[meta.uploader_id]?.avatar_url || null) : null;
        return {
          name: it.name,
          path: fullPath,
          type: guessMimeFromName(it.name),
          url: pub?.publicUrl || null,
          uploadedAt: meta?.created_at || undefined,
          sizeBytes: (typeof meta?.size_bytes === 'number' ? meta!.size_bytes : null),
          uploaderName: dispName,
          uploaderAvatarUrl: avatar,
          uploaderId: meta?.uploader_id || null,
        };
      });

      // 6. Process workspace documents
      const workspaceItems: StoredFileItem[] = workspaceDocs.map((doc) => {
        const fileName = doc.title;
        const fullPath = `${workspaceId}/documents/${fileName}`;
        const meta = (workspaceMetaRows || []).find(r => r.path === fullPath);
        const dispName = profilesMap[doc.created_by]?.name || profilesMap[doc.created_by]?.email || null;
        const avatar = profilesMap[doc.created_by]?.avatar_url || null;
        return {
          name: fileName,
          path: fullPath,
          type: doc.type || guessMimeFromName(fileName),
          url: doc.file_url,
          uploadedAt: doc.updated_at || doc.created_at,
          sizeBytes: doc.size_bytes || meta?.size_bytes || null,
          uploaderName: dispName,
          uploaderAvatarUrl: avatar,
          uploaderId: doc.created_by,
        };
      });

      // 7. Combine and sort by updated_at
      const combinedItems = [...projectItems, ...workspaceItems];
      combinedItems.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0).getTime();
        const dateB = new Date(b.uploadedAt || 0).getTime();
        return dateB - dateA; // Most recent first
      });

      setFiles(combinedItems);

      // 8. Populate sizes if missing via signed URL HEAD
      for (const f of combinedItems) {
        if (f.sizeBytes == null && f.url) {
          try {
            const bucket = f.path.includes('/documents/') ? 'workspace_documents' : 'project_files';
            const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(f.path, 60);
            const headUrl = signed?.signedUrl;
            if (headUrl) {
              const resp = await fetch(headUrl, { method: 'HEAD' });
              const len = resp.headers.get('content-length');
              if (len) {
                setFiles(prev => prev.map(x => x.path === f.path ? { ...x, sizeBytes: Number(len) } : x));
              }
            }
          } catch {}
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to list files");
    }
  }, [supabase, prefix, uploaderMap, workspaceId, projectId]);

  useEffect(() => {
    listFiles();
  }, [listFiles]);

  const onUploadClick = () => inputRef.current?.click();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      // Keep original filename (sanitize). If exists, append timestamp once.
      const originalName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      let fileName = originalName;
      const guessedType = guessMimeFromName(fileName);
      const isDocumentLike = !['image','video','audio','code','archive'].includes(guessedType);
      const bucket = isDocumentLike ? 'workspace_documents' : 'project_files';
      let path = isDocumentLike ? `${(workspaceId || 'unknown')}/documents/${fileName}` : `${prefix}/${fileName}`;
      let res = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (res.error && String(res.error.message || '').toLowerCase().includes('exists')) {
        const ts = Date.now();
        const parts = originalName.split('.');
        const ext = parts.length > 1 ? `.${parts.pop()}` : '';
        const base = parts.join('.');
        fileName = `${base}-${ts}${ext}`;
        path = isDocumentLike ? `${(workspaceId || 'unknown')}/documents/${fileName}` : `${prefix}/${fileName}`;
        res = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
      }
      if (res.error) throw res.error;
      // Capture current user name as uploader (best effort) and persist to meta table
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (userId) {
          const { data: prof } = await supabase.from('profiles').select('name, email').eq('id', userId).single();
          const uName = prof?.name || prof?.email || 'You';
          setUploaderMap(prev => ({ ...prev, [path]: uName }));
          // upsert meta row and create workspace_documents row for document-like files
          try {
            if (isDocumentLike) {
              await supabase.from('workspace_documents_meta').upsert({
                path,
                uploader_id: userId,
                size_bytes: file.size,
                created_at: new Date().toISOString(),
                file_type: guessedType,
                workspace_id: workspaceId || null,
                project_id: projectId || null,
              }, { onConflict: 'path' });
              const { data: pub } = supabase.storage.from('workspace_documents').getPublicUrl(path);
              await supabase.from('workspace_documents').insert({
                workspace_id: workspaceId,
                title: fileName,
                content: null,
                type: 'document',
                project_id: projectId || null,
                file_url: pub?.publicUrl || null,
                created_by: userId,
                status: 'draft',
              });
            } else {
              await supabase.from('project_files_meta').upsert({
                path,
                uploader_id: userId,
                size_bytes: file.size,
                created_at: new Date().toISOString(),
                file_type: guessedType,
                workspace_id: workspaceId || null,
                project_id: projectId || null,
              } as unknown as Record<string, unknown>, { onConflict: 'path' });
            }
          } catch {}
        }
      } catch {}
      await listFiles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Project Files</h3>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
          <button onClick={onUploadClick} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 cursor-pointer" disabled={uploading}>
            <Upload className="w-4 h-4"/> {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      {files.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No files yet" subtitle="Upload pitch decks, wireframes, contracts here." />
      ) : (
        <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Size</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Uploader</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {files.map((f) => (
                <tr key={f.path} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                        {renderIconForType(f.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{prefix}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.sizeBytes != null ? humanFileSize(f.sizeBytes) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.uploadedAt ? formatDate(f.uploadedAt) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      {f.uploaderAvatarUrl ? (
                        <Image src={f.uploaderAvatarUrl} alt={f.uploaderName || 'Uploader'} width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-[10px] font-medium" aria-hidden>
                          {(f.uploaderName || 'U').trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="truncate max-w-[160px]">{f.uploaderName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {f.url ? (
                        <a href={f.url} download className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Download">
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <button onClick={() => downloadViaAPI(supabase, f)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setTargetFile(f); setConfirmOpen(true); }} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmOpen && targetFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Delete file</div>
              <button onClick={() => setConfirmOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">Are you sure you want to delete &quot;{targetFile.name}&quot;?</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200">Cancel</button>
              <button disabled={deleting} onClick={async () => {
                try {
                  setDeleting(true);
                  const delBucket = (!['image','video','audio','code','archive'].includes(targetFile.type)) ? 'workspace_documents' : 'project_files';
                  const { error: delErr } = await supabase.storage.from(delBucket).remove([targetFile.path]);
                  if (delErr) throw delErr;
                  try {
                    if ((!['image','video','audio','code','archive'].includes(targetFile.type))) {
                      if (targetFile.url) {
                        await supabase.from('workspace_documents').delete().eq('file_url', targetFile.url);
                      }
                    } else {
                      await supabase.from('project_files_meta').delete().eq('path', targetFile.path);
                    }
                  } catch {}
                  setConfirmOpen(false);
                  setTargetFile(null);
                  await listFiles();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Delete failed');
                } finally {
                  setDeleting(false);
                }
              }} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function guessMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (/(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lower)) return "image";
  if (/(mp4|mov|webm|avi|mkv)$/.test(lower)) return "video";
  if (/(mp3|wav|ogg|m4a|flac)$/.test(lower)) return "audio";
  if (/(pdf)$/.test(lower)) return "pdf";
  if (/(doc|docx)$/.test(lower)) return "doc";
  if (/(xls|xlsx|csv)$/.test(lower)) return "sheet";
  if (/(ppt|pptx)$/.test(lower)) return "ppt";
  if (/(zip|rar|7z|tar|gz)$/.test(lower)) return "archive";
  if (/(txt|md)$/.test(lower)) return "text";
  if (/(js|ts|tsx|json|yml|yaml|py|rb|go|rs|java|c|cpp|cs)$/.test(lower)) return "code";
  return "file";
}

function renderIconForType(t: string) {
  switch (t) {
    case "image": return <ImageIcon className="w-5 h-5" />;
    case "video": return <Video className="w-5 h-5" />;
    case "audio": return <Music className="w-5 h-5" />;
    case "pdf": return <FileText className="w-5 h-5" />;
    case "doc": return <FileText className="w-5 h-5" />;
    case "sheet": return <FileSpreadsheet className="w-5 h-5" />;
    case "ppt": return <FileText className="w-5 h-5" />;
    case "archive": return <FileArchive className="w-5 h-5" />;
    case "code": return <FileCode className="w-5 h-5" />;
    case "text": return <FileText className="w-5 h-5" />;
    // Document types from workspace_documents table
    case "document": return <FileText className="w-5 h-5" />;
    case "contract": return <FileText className="w-5 h-5" />;
    case "legal": return <FileText className="w-5 h-5" />;
    case "proposal": return <FileText className="w-5 h-5" />;
    case "note": return <FileText className="w-5 h-5" />;
    case "ai": return <FileText className="w-5 h-5" />;
    default: return <File className="w-5 h-5" />;
  }
}

async function downloadViaAPI(supabase: ReturnType<typeof createClient>, f: StoredFileItem) {
  try {
    const { data, error } = await supabase.storage.from('project_files').download(f.path);
    if (error || !data) throw error || new Error('Download failed');
    const url = URL.createObjectURL(data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    // no-op, error surfaced earlier via setError if needed
  }
}

function humanFileSize(bytes: number) {
  if (Number.isNaN(bytes) || !Number.isFinite(bytes)) return '—';
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = ['KB','MB','GB','TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}


