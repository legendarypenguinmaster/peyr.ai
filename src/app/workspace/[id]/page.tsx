"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { 
  WorkspaceHeader,
  WorkspaceTabs,
  OverviewSection,
  ProductivitySection,
  MeetingsSection,
  TeamSection
} from "@/components/workspace";

interface Workspace {
  id: string;
  title: string;
  description: string;
  template: string;
  owner_id: string;
  created_at: string;
  members: Array<{
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
      name: string;
      avatar_url: string;
    };
  }>;
  stats: {
    tasks: number;
    diagrams: number;
    documents: number;
    meetings: number;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  assignee_id: string;
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

interface Diagram {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  file_type: string;
  created_at: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_time: string;
  duration_minutes: number;
  meeting_link: string;
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"overview" | "productivity" | "meetings" | "team">("overview");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { toasts, removeToast, showError } = useToast();
  const fetchingRef = useRef(false);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [workspaceId]);

  const fetchDiagrams = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/diagrams`);
      if (response.ok) {
        const data = await response.json();
        setDiagrams(data);
      }
    } catch (error) {
      console.error("Error fetching diagrams:", error);
    }
  }, [workspaceId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [workspaceId]);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/meetings`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  }, [workspaceId]);

  const fetchWorkspace = useCallback(async () => {
    if (fetchingRef.current) {
      console.log("Already fetching workspace, skipping...");
      return;
    }
    
    try {
      console.log("Starting to fetch workspace data...");
      fetchingRef.current = true;
      setLoading(true);
      
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }
      const data = await response.json();
      setWorkspace(data);
      
      // Fetch related data
      console.log("Fetching related data...");
      await Promise.all([
        fetchTasks(),
        fetchDiagrams(),
        fetchDocuments(),
        fetchMeetings()
      ]);
      console.log("All data fetched successfully");
    } catch (error) {
      console.error("Error fetching workspace:", error);
      alert("Failed to fetch workspace");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [workspaceId, fetchTasks, fetchDiagrams, fetchDocuments, fetchMeetings]);

  // Initialize data on mount
  useEffect(() => {
    if (workspaceId && !workspace) {
      fetchWorkspace();
    }
  }, [workspaceId, workspace, fetchWorkspace]);

  

  const addTask = async (taskData: {
    title: string;
    description: string;
    due_date?: string;
    priority: "low" | "medium" | "high" | "urgent";
    assignee_id?: string;
  }) => {
    // Optimistic add: show immediately in UI
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      title: taskData.title,
      description: taskData.description,
      status: "todo",
      assignee_id: taskData.assignee_id || "",
      created_at: new Date().toISOString(),
      ticket_number: "TEMP",
      due_date: taskData.due_date,
      priority: taskData.priority,
      task_order: 999, // Temporary high order for optimistic update
      assignee: undefined,
    };

    setTasks((prev) => [tempTask, ...prev]);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          status: "todo",
          due_date: taskData.due_date || null,
          priority: taskData.priority,
          assignee_id: taskData.assignee_id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const created: Task = await response.json();
      // Replace temp with server task
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      // Optional background refresh to pull assignee profile, etc.
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      // Revert optimistic add
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      showError("Failed to add task. Please try again.");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update: apply immediately
    const previousTasks = tasks;
    setTasks((curr) => curr.map((t) => t.id === taskId ? { ...t, status: newStatus as Task["status"] } : t));

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Optionally reconcile with server response (not required)
      // const updated = await response.json();
      // setTasks((curr) => curr.map((t) => t.id === taskId ? { ...t, ...updated } : t));

      // No need to refetch - optimistic update is already applied
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on failure
      setTasks(previousTasks);
      showError("Failed to update task. Please try again.");
    }
  };

  const reorderTasks = async (draggedTaskId: string, overTaskId: string, status: string) => {
    console.log("reorderTasks called:", { draggedTaskId, overTaskId, status });
    
    // Optimistic reorder: apply immediately
    const previousTasks = tasks;
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    const overTask = tasks.find(t => t.id === overTaskId);
    
    if (!draggedTask || !overTask) {
      console.log("Task not found:", { draggedTask: !!draggedTask, overTask: !!overTask });
      return;
    }

    // Calculate new order for the dragged task
    const tasksInColumn = tasks.filter(t => t.status === status).sort((a, b) => a.task_order - b.task_order);
    const draggedIndex = tasksInColumn.findIndex(t => t.id === draggedTaskId);
    const overIndex = tasksInColumn.findIndex(t => t.id === overTaskId);
    
    console.log("Indices:", { draggedIndex, overIndex, tasksInColumnLength: tasksInColumn.length });
    
    if (draggedIndex === -1 || overIndex === -1) {
      console.log("Invalid indices");
      return;
    }

    // Reorder the tasks array
    const newTasks = [...tasksInColumn];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(overIndex, 0, draggedTask);
    
    console.log("New order:", newTasks.map(t => ({ id: t.id, title: t.title, order: t.task_order })));
    
    // Update task_order for all affected tasks
    const updatedTasks = tasks.map(task => {
      if (task.status === status) {
        const newIndex = newTasks.findIndex(t => t.id === task.id);
        return { ...task, task_order: newIndex + 1 };
      }
      return task;
    });

    console.log("Updated tasks:", updatedTasks.filter(t => t.status === status).map(t => ({ id: t.id, title: t.title, order: t.task_order })));
    setTasks(updatedTasks);

    try {
      // Send reorder request to API
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draggedTaskId,
          overTaskId,
          status
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reorder tasks");
      }
    } catch (error) {
      console.error("Error reordering tasks:", error);
      // Revert on failure
      setTasks(previousTasks);
      showError("Failed to reorder tasks. Please try again.");
    }
  };

  const moveTaskWithPosition = async (taskId: string, newStatus: string, overTaskId: string) => {
    console.log("moveTaskWithPosition called:", { taskId, newStatus, overTaskId });
    
    // Optimistic update: apply immediately
    const previousTasks = tasks;
    const draggedTask = tasks.find(t => t.id === taskId);
    const overTask = tasks.find(t => t.id === overTaskId);
    
    if (!draggedTask || !overTask) {
      console.log("Task not found:", { draggedTask: !!draggedTask, overTask: !!overTask });
      return;
    }

    // Get tasks in the destination column (sorted by order)
    const tasksInDestinationColumn = tasks.filter(t => t.status === newStatus).sort((a, b) => a.task_order - b.task_order);
    const overIndex = tasksInDestinationColumn.findIndex(t => t.id === overTaskId);
    
    console.log("Destination column tasks:", tasksInDestinationColumn.map(t => ({ id: t.id, title: t.title, order: t.task_order })));
    console.log("Over task index:", overIndex);
    
    if (overIndex === -1) {
      console.log("Over task not found in destination column");
      return;
    }

    // Create new task with updated status and position
    const updatedDraggedTask = { ...draggedTask, status: newStatus as Task["status"] };
    
    // Insert the dragged task at the correct position
    const newTasksInColumn = [...tasksInDestinationColumn];
    newTasksInColumn.splice(overIndex, 0, updatedDraggedTask);
    
    // Update task_order for all tasks in the destination column
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        // This is the moved task
        return { ...task, status: newStatus as Task["status"], task_order: overIndex + 1 };
      } else if (task.status === newStatus) {
        // This is a task in the destination column
        const newIndex = newTasksInColumn.findIndex(t => t.id === task.id);
        return { ...task, task_order: newIndex + 1 };
      }
      return task;
    });

    console.log("Updated tasks after move:", updatedTasks.filter(t => t.status === newStatus).map(t => ({ id: t.id, title: t.title, order: t.task_order })));
    setTasks(updatedTasks);

    try {
      // Send move with position request to API
      const response = await fetch(`/api/workspaces/${workspaceId}/tasks/move-with-position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          newStatus,
          overTaskId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to move task with position");
      }
    } catch (error) {
      console.error("Error moving task with position:", error);
      // Revert on failure
      setTasks(previousTasks);
      showError("Failed to move task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 dark:text-gray-400">Workspace not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <WorkspaceHeader workspace={workspace} />
        
        <WorkspaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewSection workspace={workspace} />
        )}

            {activeTab === "productivity" && (
              <ProductivitySection
                tasks={tasks}
                diagrams={diagrams}
                documents={documents}
                workspace={workspace}
                onUpdateTaskStatus={updateTaskStatus}
                onReorderTasks={reorderTasks}
                onMoveTaskWithPosition={moveTaskWithPosition}
                onAddTask={addTask}
              />
            )}

        {activeTab === "meetings" && (
          <MeetingsSection meetings={meetings} workspace={workspace} />
        )}

        {activeTab === "team" && (
          <TeamSection workspace={workspace} />
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}