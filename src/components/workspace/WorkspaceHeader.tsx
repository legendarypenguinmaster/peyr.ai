"use client";

import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  title: string;
  description: string;
  members: Array<{
    role: string;
    joined_at: string;
    profiles: {
      name: string;
      avatar_url: string;
    };
  }>;
}

interface WorkspaceHeaderProps {
  workspace: Workspace;
}

export default function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        onClick={() => router.push("/workspace")}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Workspaces
      </button>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {workspace.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {workspace.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
