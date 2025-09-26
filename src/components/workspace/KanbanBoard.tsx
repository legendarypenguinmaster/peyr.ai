"use client";

import { useState, type ReactNode } from "react";
import { Plus, Calendar, GripVertical } from "lucide-react";
import Image from "next/image";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  assignee_id?: string;
  created_at: string;
  ticket_number: string;
  due_date?: string;
  priority: "low" | "medium" | "high" | "urgent";
  task_order: number;
  assignee?: {
    name: string;
    avatar_url?: string;
  };
}

interface Workspace {
  id: string;
  members: Array<{
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
      name: string;
      avatar_url: string;
    };
  }>;
}

interface KanbanBoardProps {
  tasks: Task[];
  workspace: Workspace;
  onUpdateTaskStatus: (taskId: string, newStatus: string) => void;
  onReorderTasks: (draggedTaskId: string, overTaskId: string, status: string) => void;
  onMoveTaskWithPosition: (taskId: string, newStatus: string, overTaskId: string) => void;
  onAddTask: (taskData: {
    title: string;
    description: string;
    due_date?: string;
    priority: "low" | "medium" | "high" | "urgent";
    assignee_id?: string;
  }) => void;
}

function KanbanDroppableColumn({ columnId, children }: { columnId: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className={isOver ? "ring-2 ring-blue-400 rounded-xl" : undefined}>
      {children}
    </div>
  );
}

// Sortable Task Item Component
function SortableTaskItem({ task, onClickTitle }: {
  task: Task;
  onClickTitle?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const createdDate = new Date(task.created_at).toLocaleDateString();

  const isSaving = task.ticket_number === "TEMP" || (task.id && task.id.startsWith("temp-"));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {task.ticket_number || `TASK-${task.id.slice(-3)}`}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority || 'medium')}`}>
            {task.priority || 'medium'}
          </span>
          {isSaving && (
            <span className="inline-flex items-center text-[11px] text-blue-600 dark:text-blue-400">
              <span className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Saving
            </span>
          )}
        </div>
      </div>

      {/* Title (clickable) */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (onClickTitle) { onClickTitle(); } }}
        className="block text-left font-medium text-gray-900 dark:text-white text-sm mb-2 hover:underline"
      >
        {task.title}
      </button>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description.length > 25 ? `${task.description.slice(0, 25)}…` : task.description}
        </p>
      )}

      {/* Footer with dates and assignee */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Created {createdDate}</span>
          {task.due_date && (
            <div className={`flex items-center text-xs ${
              isOverdue(task.due_date) 
                ? "text-red-600 dark:text-red-400" 
                : "text-gray-500 dark:text-gray-400"
            }`}>
              <Calendar className="w-3 h-3 mr-1" />
              {formatDueDate(task.due_date)}
            </div>
          )}
        </div>
        
        {/* Assignee Avatar */}
        {task.assignee && (
          <div className="flex items-center">
            {task.assignee.avatar_url ? (
              <Image
                src={task.assignee.avatar_url}
                alt={task.assignee.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, workspace, onUpdateTaskStatus, onReorderTasks, onMoveTaskWithPosition, onAddTask }: KanbanBoardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.task_order - b.task_order);
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const draggedTask = tasks.find(t => t.id === taskId);
    if (!draggedTask) return;

    // Determine destination column (container) id
    const validStatuses = new Set(["todo", "in_progress", "review", "done"]);
    const containerId = (over.data && (over.data.current as { sortable?: { containerId?: string } } | undefined))?.sortable?.containerId;
    const possibleStatus = containerId ?? (typeof over.id === "string" ? (over.id as string) : undefined);
    const newStatus = possibleStatus && validStatuses.has(possibleStatus) ? possibleStatus : undefined;

    if (!newStatus) {
      return;
    }

    // Check if we're dropping on another task (for reordering)
    const overTask = tasks.find(t => t.id === over.id);
    
    if (overTask && overTask.status === newStatus && draggedTask.status === newStatus) {
      // Reordering within the same column
      console.log("Reordering tasks:", draggedTask.id, "over", overTask.id, "in", newStatus);
      onReorderTasks(draggedTask.id, overTask.id, newStatus);
    } else if (draggedTask.status !== newStatus) {
      // Moving to a different column
      if (overTask && overTask.status === newStatus) {
        // Moving to a different column and dropping on a specific task
        console.log("Moving task to different column with position:", taskId, "to", newStatus, "over", overTask.id);
        onMoveTaskWithPosition(taskId, newStatus, overTask.id);
      } else {
        // Moving to a different column and dropping on empty space (top of column)
        console.log("Moving task to different column (top):", taskId, "to", newStatus);
        onUpdateTaskStatus(taskId, newStatus);
      }
    }
    // If same column but not dropping on a task, do nothing (just return to original position)
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask({
      title: newTaskTitle,
      description: newTaskDescription,
      due_date: newTaskDueDate || undefined,
      priority: newTaskPriority,
      assignee_id: newTaskAssignee || undefined
    });

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setNewTaskAssignee("");
    setShowAddTask(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {["todo", "in_progress", "review", "done"].map((status) => (
          <KanbanDroppableColumn key={status} columnId={status}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                {status.replace("_", " ")}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTasksByStatus(status).length}
              </span>
            </div>
            
            <SortableContext
              id={status}
              items={getTasksByStatus(status).map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[200px]">
                {getTasksByStatus(status).map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onClickTitle={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </SortableContext>
            
            {status === "todo" && (
              <div className="mt-4">
                {showAddTask ? (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="text"
                      placeholder="Task title *"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assignee
                      </label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {workspace.members.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.profiles.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddTask}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTaskTitle("");
                          setNewTaskDescription("");
                          setNewTaskDueDate("");
                          setNewTaskPriority("medium");
                          setNewTaskAssignee("");
                        }}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-sm">Add Task</span>
                  </button>
                )}
              </div>
            )}
            </div>
          </KanbanDroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg opacity-90 rotate-3">
            <div className="flex items-center space-x-2 mb-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {tasks.find(t => t.id === activeId)?.ticket_number || `TASK-${activeId.slice(-3)}`}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {tasks.find(t => t.id === activeId)?.title}
            </h4>
          </div>
        ) : null}
      </DragOverlay>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedTask(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Task</h3>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setSelectedTask(null)}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.due_date ? selectedTask.due_date.substring(0,10) : ""}
                    onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value as Task["priority"] })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                <select
                  value={String(selectedTask.assignee_id ?? "")}
                  onChange={(e) => setSelectedTask({ ...selectedTask, assignee_id: e.target.value ? e.target.value : undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {workspace.members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>{member.profiles.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={async () => {
                  if (!selectedTask) return;
                  setIsSaving(true);
                  try {
                    const res = await fetch(`/api/workspaces/${workspace.id}/tasks/${selectedTask.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: selectedTask.title,
                        description: selectedTask.description || "",
                        priority: selectedTask.priority,
                        due_date: selectedTask.due_date ?? null,
                        assignee_id: selectedTask.assignee_id ?? null,
                      })
                    });
                    if (!res.ok) throw new Error("Failed to save task");
                    setSelectedTask(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
