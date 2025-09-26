"use client";

import { CheckSquare, GitBranch, FileText, Video } from "lucide-react";

interface Workspace {
  stats: {
    tasks: number;
    diagrams: number;
    documents: number;
    meetings: number;
  };
}

interface OverviewSectionProps {
  workspace: Workspace;
}

export default function OverviewSection({ workspace }: OverviewSectionProps) {
  const stats = [
    {
      label: "Tasks",
      value: workspace.stats.tasks,
      icon: CheckSquare,
      color: "text-blue-600"
    },
    {
      label: "Diagrams",
      value: workspace.stats.diagrams,
      icon: GitBranch,
      color: "text-green-600"
    },
    {
      label: "Documents",
      value: workspace.stats.documents,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      label: "Meetings",
      value: workspace.stats.meetings,
      icon: Video,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <IconComponent className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
