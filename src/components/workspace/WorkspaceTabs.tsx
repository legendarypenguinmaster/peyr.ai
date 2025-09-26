"use client";

import { BarChart3, Video, Users } from "lucide-react";

interface WorkspaceTabsProps {
  activeTab: "overview" | "productivity" | "meetings" | "team";
  setActiveTab: (tab: "overview" | "productivity" | "meetings" | "team") => void;
}

export default function WorkspaceTabs({ activeTab, setActiveTab }: WorkspaceTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "productivity", label: "Productivity", icon: BarChart3 },
    { id: "meetings", label: "Meetings", icon: Video },
    { id: "team", label: "Team", icon: Users }
  ];

  return (
    <div className="mb-8">
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkspaceTabsProps["activeTab"])}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
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
  );
}
