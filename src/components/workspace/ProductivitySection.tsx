"use client";

import { useState } from "react";
import { 
  Plus, 
  Kanban, 
  GitBranch, 
  Calendar as CalendarIcon, 
  FileText as FileTextIcon, 
  Timer,
  Eye,
  Share2,
  Download,
  Play,
  Calendar
} from "lucide-react";
import KanbanBoard from "./KanbanBoard";

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

interface ProductivitySectionProps {
  tasks: Task[];
  diagrams: Diagram[];
  documents: Document[];
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

export default function ProductivitySection({ 
  tasks, 
  diagrams, 
  documents, 
  workspace, 
  onUpdateTaskStatus, 
  onReorderTasks,
  onMoveTaskWithPosition,
  onAddTask 
}: ProductivitySectionProps) {
  const [activeProductivityTab, setActiveProductivityTab] = useState<"kanban" | "diagrams" | "calendar" | "documents" | "time-tracking">("kanban");

  const productivityTabs = [
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "diagrams", label: "AI Diagrams", icon: GitBranch },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "documents", label: "Documents", icon: FileTextIcon },
    { id: "time-tracking", label: "Time Tracking", icon: Timer }
  ];

  return (
    <div>
      {/* Productivity Sub-tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {productivityTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
            <button
              key={tab.id}
              onClick={() => setActiveProductivityTab(tab.id as typeof activeProductivityTab)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeProductivityTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      {activeProductivityTab === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          workspace={workspace}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onReorderTasks={onReorderTasks}
          onMoveTaskWithPosition={onMoveTaskWithPosition}
          onAddTask={onAddTask}
        />
      )}

      {/* AI Diagrams */}
      {activeProductivityTab === "diagrams" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Diagrams</h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Diagram
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => (
              <div key={diagram.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{diagram.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{diagram.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(diagram.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {activeProductivityTab === "calendar" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Calendar Integration</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sync deadlines and meetings with your calendar
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Connect Google Calendar
          </button>
        </div>
      )}

      {/* Documents */}
      {activeProductivityTab === "documents" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Documents</h3>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Upload
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <FileTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{document.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{document.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(document.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Tracking */}
      {activeProductivityTab === "time-tracking" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timer</h3>
            <div className="text-center">
              <div className="text-4xl font-mono text-gray-900 dark:text-white mb-4">00:00:00</div>
              <button className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Logged Today</h3>
            <div className="space-y-3">
              {workspace.members.map((member, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {member.profiles.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{member.profiles.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.floor(Math.random() * 8) + 1}h {Math.floor(Math.random() * 60)}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
