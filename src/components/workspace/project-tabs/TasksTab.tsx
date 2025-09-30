"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
        {children}
      </div>
    </div>
  );
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_by?: string | null;
  due_date: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  task_id?: string | null;
  task_order?: number | null;
}

type ColumnKey = 'todo' | 'in_progress' | 'review' | 'completed';

function Column({
  title,
  items,
  onOpen,
  onDropTask,
  bgClass,
  members,
  isDragging,
  assigneeMap,
}: {
  title: string;
  items: Task[];
  onOpen: (task: Task) => void;
  onDropTask: (taskId: string, from: string, to: string) => void;
  bgClass: string;
  members: { id: string; name: string | null; email: string | null }[];
  isDragging: boolean;
  assigneeMap: Record<string, { name: string | null; email: string | null; avatar_url: string | null }>;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${bgClass} ${isDragging ? 'cursor-grabbing' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/taskId');
        const from = e.dataTransfer.getData('text/fromColumn');
        if (taskId && from) {
          onDropTask(taskId, from, title);
        }
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onOpen(item)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/taskId', item.id);
              e.dataTransfer.setData('text/fromColumn', title);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={() => { /* signal end handled by parent via state */ }}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer hover:cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.task_id || '#'}</div>
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.title}</div>
            {item.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{truncate(item.description, 30)}</div>
            )}
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                {renderAssigneeAvatar(item.assigned_to, members, assigneeMap)}
                {getAssigneeDisplayName(item.assigned_to, members, assigneeMap)}
              </span>
              {(() => {
                const overdue = !!(item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed');
                return (
                  <span className={`inline-flex items-center gap-1 text-[11px] ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>Due: {formatDateYMD(item.due_date)}</span>
                  </span>
                );
              })()}
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">No tasks</div>
        )}
      </div>
    </div>
  );
}

export default function TasksTab({ columns, /* projectName unused */ projectName: _projectName, members, /* allTasks unused */ allTasks: _allTasks, workspaceId, projectId }: {
  columns: { todo: Task[]; in_progress: Task[]; review: Task[]; completed: Task[] };
  projectName: string;
  members: { id: string; name: string | null; email: string | null }[];
  allTasks: Task[];
  workspaceId?: string;
  projectId?: string;
}) {
  void _projectName;
  void _allTasks;
  const [open, setOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localCols, setLocalCols] = useState(columns);
  const [isDragging, setIsDragging] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assigned_to: '', due_date: '' });
  const [assigneeMap, setAssigneeMap] = useState<Record<string, { name: string | null; email: string | null; avatar_url: string | null }>>({});
  const [owner, setOwner] = useState<{ id: string; name: string | null; email: string | null } | null>(null);

  // Fetch project owner and include in assignee options
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data: proj, error: pErr } = await supabase
          .from('workspace_projects')
          .select('created_by')
          .eq('id', projectId)
          .single();
        if (pErr || !proj?.created_by) return;
        const ownerId = proj.created_by as string;
        if (members.some(m => m.id === ownerId)) {
          const existing = members.find(m => m.id === ownerId) || null;
          setOwner(existing);
          return;
        }
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', ownerId)
          .single();
        if (!profErr && profile) {
          setOwner({ id: profile.id as string, name: profile.name, email: profile.email });
        }
      } catch {
        // ignore
      }
    })();
  }, [projectId, members]);

  const augmentedMembers = useMemo(() => {
    const list = [...members];
    if (owner && !list.some(m => m.id === owner.id)) {
      list.unshift(owner);
    }
    return list;
  }, [members, owner]);

  useEffect(() => {
    setLocalCols(columns);
  }, [columns]);

  // Resolve assignee names for any ids not provided in members
  useEffect(() => {
    const allItems: Task[] = [
      ...localCols.todo,
      ...localCols.in_progress,
      ...localCols.review,
      ...localCols.completed,
    ];
    const ids = Array.from(new Set(allItems.map(t => t.assigned_to).filter(Boolean) as string[]));
    const knownIds = new Set([...(augmentedMembers || []).map(m => m.id), ...Object.keys(assigneeMap)]);
    const missing = ids.filter(id => !knownIds.has(id));
    
    console.log('TasksTab: Missing assignee IDs:', missing);
    console.log('TasksTab: All assignee IDs:', ids);
    console.log('TasksTab: Known IDs:', Array.from(knownIds));
    
    if (missing.length === 0) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', missing);
        if (error) {
          console.error('TasksTab: Error fetching assignee profiles:', error);
          return;
        }
        console.log('TasksTab: Fetched assignee profiles:', data);
        const next: Record<string, { name: string | null; email: string | null; avatar_url: string | null }> = { ...assigneeMap };
        (data || []).forEach((p: { id: string; name: string | null; email: string | null; avatar_url: string | null }) => { next[p.id] = { name: p.name || null, email: p.email || null, avatar_url: p.avatar_url || null }; });
        setAssigneeMap(next);
      } catch (err) {
        console.error('TasksTab: Exception fetching assignee profiles:', err);
      }
    })();
  }, [localCols, members, assigneeMap, augmentedMembers]);

  const onOpen = (task: Task) => { setActiveTask(task); setOpen(true); };
  const onClose = () => { setOpen(false); setActiveTask(null); };

  const onTaskUpdate = (updatedTask: Task) => {
    setLocalCols(prev => {
      const copy: Record<ColumnKey, Task[]> = { ...(prev as Record<ColumnKey, Task[]>) };
      // Find and update the task in the correct column
      const statusKey = updatedTask.status as ColumnKey;
      const otherKeys = (Object.keys(copy) as ColumnKey[]).filter(k => k !== statusKey);
      
      // Remove from all columns first
      otherKeys.forEach(key => {
        copy[key] = copy[key].filter((t: Task) => t.id !== updatedTask.id);
      });
      
      // Add to the correct column, maintaining position if status didn't change
      if (updatedTask.status === activeTask?.status) {
        // Status didn't change, just update in place
        const colIndex = copy[statusKey].findIndex((t: Task) => t.id === updatedTask.id);
        if (colIndex >= 0) {
          copy[statusKey][colIndex] = updatedTask;
        }
      } else {
        // Status changed, add to new column
        copy[statusKey] = [updatedTask, ...copy[statusKey]];
      }
      
      return copy;
    });
  };

  const onTaskDelete = (deletedTaskId: string) => {
    setLocalCols(prev => {
      const copy: Record<ColumnKey, Task[]> = { ...(prev as Record<ColumnKey, Task[]>) };
      // Remove from all columns
      (Object.keys(copy) as ColumnKey[]).forEach(key => {
        copy[key] = copy[key].filter((t: Task) => t.id !== deletedTaskId);
      });
      return copy;
    });
    onClose();
  };

  const moveTask = (taskId: string, from: string, to: string) => {
    if (from === to) return;
    setIsDragging(false);
    setLocalCols(prev => {
      const copy: Record<ColumnKey, Task[]> = { ...(prev as Record<ColumnKey, Task[]>) };
      const fromKey = mapTitleToKey(from);
      const toKey = mapTitleToKey(to);
      const task = copy[fromKey].find((t: Task) => t.id === taskId);
      if (!task) return prev;
      copy[fromKey] = copy[fromKey].filter((t: Task) => t.id !== taskId);
      const updatedTask: Task = { ...task, status: mapTitleToStatus(to) as Task['status'] };
      copy[toKey] = [updatedTask, ...copy[toKey]];
      return copy;
    });

    // Persist to API
    fetch('/api/workspaces/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status: mapTitleToStatus(to) })
    }).catch(() => {/* swallow */});
  };

  const mapTitleToKey = (title: string): ColumnKey => {
    switch (title) {
      case 'To Do': return 'todo';
      case 'In Progress': return 'in_progress';
      case 'Review': return 'review';
      case 'Done': return 'completed';
      default: return 'todo';
    }
  };

  const mapTitleToStatus = (title: string) => {
    switch (title) {
      case 'To Do': return 'todo';
      case 'In Progress': return 'in_progress';
      case 'Review': return 'review';
      case 'Done': return 'completed';
      default: return 'todo';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4 flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">+ Add Task</button>
        </div>
        <Column
          title="To Do"
          items={localCols.todo}
          onOpen={onOpen}
          onDropTask={moveTask}
          bgClass="bg-gray-50 dark:bg-gray-900/30"
          members={augmentedMembers}
          isDragging={isDragging}
          assigneeMap={assigneeMap}
        />
        <Column
          title="In Progress"
          items={localCols.in_progress}
          onOpen={onOpen}
          onDropTask={moveTask}
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          members={augmentedMembers}
          isDragging={isDragging}
          assigneeMap={assigneeMap}
        />
        <Column
          title="Review"
          items={localCols.review}
          onOpen={onOpen}
          onDropTask={moveTask}
          bgClass="bg-purple-50 dark:bg-purple-900/20"
          members={augmentedMembers}
          isDragging={isDragging}
          assigneeMap={assigneeMap}
        />
        <Column
          title="Done"
          items={localCols.completed}
          onOpen={onOpen}
          onDropTask={moveTask}
          bgClass="bg-green-50 dark:bg-green-900/20"
          members={augmentedMembers}
          isDragging={isDragging}
          assigneeMap={assigneeMap}
        />
      </div>
      <Modal open={open} onClose={onClose}>
        {activeTask && (
          <TaskEditor
            task={activeTask}
            members={augmentedMembers}
            assigneeMap={assigneeMap}
            onClose={onClose}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Create Task</div>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Title</label>
              <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="w-full min-h-24 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Assignee</label>
                <select value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                  <option value="">Unassigned</option>
                  {augmentedMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name || m.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Cancel</button>
            <button onClick={() => createTask({ workspaceId, projectId, newTask, setShowCreate })} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function lookupUserName(id: string | null | undefined, members: { id: string; name: string | null; email: string | null }[]) {
  if (!id) return '-';
  const m = members.find(x => x.id === id);
  return m?.name || m?.email || '-';
}

function getAssigneeDisplayName(
  assignedTo: string | null | undefined, 
  members: { id: string; name: string | null; email: string | null }[],
  assigneeMap: Record<string, { name: string | null; email: string | null; avatar_url: string | null }>
) {
  const memberName = lookupUserName(assignedTo, members);
  if (memberName && memberName !== '-') return memberName;
  
  const assigneeData = assignedTo ? assigneeMap[assignedTo] : null;
  if (assigneeData?.name) return assigneeData.name;
  if (assigneeData?.email) return assigneeData.email;
  
  if (assignedTo) return assignedTo.slice(0, 8);
  return '—';
}

function renderAssigneeAvatar(
  assignedTo: string | null | undefined,
  members: { id: string; name: string | null; email: string | null }[],
  assigneeMap: Record<string, { name: string | null; email: string | null; avatar_url: string | null }>
) {
  if (!assignedTo) return null;
  const member = members.find(m => m.id === assignedTo);
  const map = assigneeMap[assignedTo];
  const avatarUrl = (map && map.avatar_url) || null;
  const displayName = member?.name || map?.name || member?.email || map?.email || '';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName || 'Assignee'}
        width={20}
        height={20}
        className="h-5 w-5 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-[10px] font-medium"
      aria-hidden
    >
      {initial}
    </span>
  );
}

function truncate(text: string, max: number) {
  if (!text) return '';
  const clean = String(text).trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, Math.max(0, max - 1)) + '…';
}

function formatDateYMD(d?: string | null) {
  if (!d) return '—';
  try {
    const iso = new Date(d).toISOString();
    return iso.slice(0, 10);
  } catch {
    return '—';
  }
}

function TaskEditor({ task, members, assigneeMap = {}, onClose, onTaskUpdate, onTaskDelete }: { 
  task: Task; 
  members: { id: string; name: string | null; email: string | null }[]; 
  assigneeMap?: Record<string, { name: string | null; email: string | null; avatar_url: string | null }>;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}) {
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'medium',
    assigned_to: task.assigned_to || '',
    due_date: task.due_date ? task.due_date.substring(0,10) : '',
  });

  const save = async () => {
    try {
      const res = await fetch('/api/workspaces/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          assignedTo: form.assigned_to || null,
          dueDate: form.due_date || null,
        })
      });
      if (res.ok) {
        // Update local state with the edited task
        const updatedTask = {
          ...task,
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          assigned_to: form.assigned_to || null,
          due_date: form.due_date || null,
          updated_at: new Date().toISOString(),
        };
        onTaskUpdate(updatedTask);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const remove = async () => {
    try {
      const res = await fetch('/api/workspaces/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id })
      });
      if (res.ok) {
        onTaskDelete(task.id);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            {renderAssigneeAvatar(task.assigned_to, members, assigneeMap)}
            <span>{getAssigneeDisplayName(task.assigned_to, members, assigneeMap)}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">{task.task_id || ''}</div>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-600 dark:text-gray-400 mb-1">Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-gray-600 dark:text-gray-400 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full min-h-24 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Task['status'] })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1">Assignee</label>
            <div className="relative">
              <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white">
                <option value="">Unassigned</option>
                {(members as { id: string; name: string | null; email: string | null }[]).map((m) => (
                  <option key={m.id} value={m.id}>{m.name || m.email}</option>
                ))}
                {/* Ensure current assignee appears even if not in members */}
                {form.assigned_to && !(members as { id: string }[]).find((m) => m.id === form.assigned_to) && (
                  <option value={form.assigned_to}>
                    {assigneeMap[form.assigned_to]?.name || assigneeMap[form.assigned_to]?.email || form.assigned_to.slice(0,8)}
                  </option>
                )}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={remove} className="px-3 py-2 rounded-lg border border-red-300 text-sm text-red-700 dark:text-red-400">Delete</button>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Cancel</button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}

// removed unused handleCreate
async function createTask({ workspaceId, projectId, newTask, setShowCreate }: { workspaceId?: string; projectId?: string; newTask: { title: string; description: string; priority: string; status: string; assigned_to: string; due_date: string }; setShowCreate: (v: boolean) => void }) {
  try {
    const payload: { workspaceId?: string; projectId?: string; title: string; description: string; status: string; priority: string; assignedTo: string | null; dueDate: string | null } = {
      workspaceId,
      projectId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      assignedTo: newTask.assigned_to || null,
      dueDate: newTask.due_date || null,
    };
    const res = await fetch('/api/workspaces/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload as Record<string, unknown>)
    });
    if (!res.ok) throw new Error('Failed to create task');
    setShowCreate(false);
    // Optionally: refresh or optimistically add to local state
  } catch {}
}


