"use client";

import React from "react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  due_date: string | null;
  status: string;
  progress?: number;
}

export default function RecentProjects({ workspaceId }: { workspaceId: string }) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/projects?limit=3`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        if (!cancelled) setProjects(data.projects || []);
      } catch {
        if (!cancelled) setError('Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [workspaceId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'overdue':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-600';
      case 'overdue':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const calculateProgress = (project: Project) => {
    // For now, return a mock progress based on status
    // In the future, this could be calculated from actual task completion
    switch (project.status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in_progress':
        return Math.floor(Math.random() * 60) + 30; // 30-90%
      case 'overdue':
        return Math.floor(Math.random() * 50) + 20; // 20-70%
      default:
        return Math.floor(Math.random() * 30) + 10; // 10-40%
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Projects</h3>
      {projects.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No projects yet. Create your first project to get started!</p>
      ) : (
        <div className="space-y-4">
          {projects.map(project => {
            const progress = calculateProgress(project);
            return (
              <Link
                key={project.id}
                href={`/workspace-hub/${workspaceId}/projects/${project.id}#overview`}
                className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                  <span className={`text-sm ${getStatusColor(project.status)}`}>
                    {project.status === 'completed' ? 'Complete' : 
                     project.status === 'in_progress' ? `${progress}%` :
                     project.status === 'overdue' ? 'Overdue' : project.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(project.status)}`}
                    style={{width: `${progress}%`}}
                  ></div>
                </div>
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                )}
                {project.due_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Due: {new Date(project.due_date).toLocaleDateString()}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
