"use client";

import { Video, Calendar, Share2, Clock, Timer, Users, Copy, Play } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_time: string;
  duration_minutes: number;
  meeting_link: string;
}

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

interface MeetingsSectionProps {
  meetings: Meeting[];
  workspace: Workspace;
}

export default function MeetingsSection({ meetings, workspace }: MeetingsSectionProps) {
  return (
    <div>
      {/* Meeting Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Instant Meeting</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Begin a meeting right now</p>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Start Meeting
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Schedule Meeting</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Plan for later</p>
          <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            Schedule
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Share2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Join Meeting</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Join with meeting ID</p>
          <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Join
          </button>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Upcoming Meetings</h3>
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{meeting.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{meeting.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(meeting.meeting_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(meeting.meeting_time).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 mr-2" />
                      {meeting.duration_minutes} mins
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {workspace.members.length} attendees
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <Play className="w-4 h-4 mr-2" />
                    Join
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
