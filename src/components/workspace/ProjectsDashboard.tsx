"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Filter, Grid, List, Calendar, Brain, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";

interface WorkspaceData {
  id: string;
  name: string;
  purpose: string;
  description: string | null;
  ai_features: unknown;
  created_at: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  workspace_tasks: Task[];
}

interface Profile {
  name: string | null;
  email: string | null;
  first_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
}

interface ProjectsDashboardProps {
  workspaceId: string;
  workspaceName: string;
  workspaceData: WorkspaceData | null;
  projects: Project[];
  profile: Profile;
}

type FilterType = "all" | "active" | "completed";
type ViewType = "list" | "kanban" | "timeline";

export default function ProjectsDashboard({ 
  workspaceId, 
  workspaceName, 
  workspaceData, 
  projects, 
  profile 
}: ProjectsDashboardProps) {
  void workspaceData;
  void profile;
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeView, setActiveView] = useState<ViewType>("list");

  // Filter projects based on active filter
  const filteredProjects = projects.filter((project) => {
    switch (activeFilter) {
      case "active":
        return project.status === "active" || project.status === "in_progress";
      case "completed":
        return project.status === "completed";
      default:
        return true; // "all"
    }
  });

  // Calculate project statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active" || p.status === "in_progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const overdueProjects = projects.filter(p => {
    const hasOverdueTasks = p.workspace_tasks.some(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
    );
    return hasOverdueTasks;
  }).length;

  return (
    <div className="p-8 h-full">
      {/* Header / Controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects - {workspaceName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your workspace projects with AI-powered insights
            </p>
          </div>
          <Link 
            href={`/workspace-hub/${workspaceId}/projects/new`}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Project</span>
          </Link>
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { key: "all" as FilterType, label: "All Projects", count: totalProjects },
                  { key: "active" as FilterType, label: "Active", count: activeProjects },
                  { key: "completed" as FilterType, label: "Completed", count: completedProjects },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeFilter === filter.key
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: "list" as ViewType, icon: List, label: "List" },
              { key: "kanban" as ViewType, icon: Grid, label: "Kanban" },
              { key: "timeline" as ViewType, icon: Calendar, label: "Timeline" },
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                className={`p-2 rounded-md transition-colors ${
                  activeView === view.key
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={view.label}
              >
                <view.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Project Overview Panel */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Project Insights</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Powered by GPT-4o</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  {totalProjects > 0 ? (
                    <>
                      {activeProjects} projects are on track. {overdueProjects > 0 && `${overdueProjects} have overdue tasks.`} 
                      {overdueProjects > 0 ? " AI suggests reallocating tasks or auto-generating draft findings." : " All projects are progressing well."}
                    </>
                  ) : (
                    "No projects yet. Create your first project to get AI-powered insights and recommendations."
                  )}
                </p>
                {overdueProjects > 0 && (
                  <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {overdueProjects} project{overdueProjects > 1 ? 's' : ''} with overdue tasks
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    📊 {totalProjects} total projects
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                    ✅ {completedProjects} completed
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                    🔄 {activeProjects} active
                  </span>
                </div>
              </div>
            </div>
            <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Ask AI
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-8">
        {/* Left Content - Project List / Grid */}
        <div className="flex-1">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project) => {
                const completedTasks = project.workspace_tasks.filter(task => task.status === "completed").length;
                const totalTasks = project.workspace_tasks.length;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                const isOverdue = project.workspace_tasks.some(task => 
                  task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
                );

                return (
                  <Link 
                    key={project.id} 
                    href={`/workspace-hub/${workspaceId}/projects/${project.id}`}
                    className="group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isOverdue && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          {project.status === "completed" && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {project.status === "active" && (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Tasks</span>
                          <span className="text-gray-900 dark:text-white">
                            {completedTasks}/{totalTasks} completed
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`capitalize ${
                            project.status === "completed" ? "text-green-600 dark:text-green-400" :
                            project.status === "active" ? "text-blue-600 dark:text-blue-400" :
                            "text-gray-600 dark:text-gray-400"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Created</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* AI Suggestions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            AI suggests: {isOverdue ? "Review overdue tasks" : "Continue current progress"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeFilter === "all" ? "No projects yet" : `No ${activeFilter} projects`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeFilter === "all" 
                  ? "Create your first project to get started with AI-powered project management"
                  : `No ${activeFilter} projects found. Try changing the filter or create a new project.`
                }
              </p>
              <Link 
                href={`/workspace-hub/${workspaceId}/projects/new`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Your First Project</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Add Task</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Generate AI Report</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Invite Collaborator</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Export Timeline</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
