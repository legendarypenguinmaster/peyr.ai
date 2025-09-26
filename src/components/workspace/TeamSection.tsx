"use client";

import { UserPlus, Trash2 } from "lucide-react";

interface Workspace {
  members: Array<{
    role: string;
    joined_at: string;
    profiles: {
      name: string;
      avatar_url: string;
    };
  }>;
}

interface TeamSectionProps {
  workspace: Workspace;
}

export default function TeamSection({ workspace }: TeamSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {workspace.members.map((member, index) => (
            <div key={index} className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {member.profiles.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.profiles.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
