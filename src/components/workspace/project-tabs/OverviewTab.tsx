"use client";
import { Brain, Activity, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

export default function OverviewTab({ completedCount, overdueCount, progressPct, totalTasks }: {
  completedCount: number;
  overdueCount: number;
  progressPct: number;
  totalTasks: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Project Summary</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            AI summary placeholder. Once connected to GPT, this will reflect recent changes and suggest next steps.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <CalendarDays className="w-4 h-4" /> Updated today
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Project created by you</li>
            {completedCount > 0 && <li>{completedCount} task{completedCount>1?'s':''} completed</li>}
            {overdueCount > 0 && <li className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400"><AlertTriangle className="w-4 h-4"/> {overdueCount} overdue task{overdueCount>1?'s':''}</li>}
          </ul>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Milestones Timeline</h3>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
            <span>{completedCount}/{totalTasks} completed</span>
            <span>{progressPct}%</span>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Quick Insights</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> {completedCount} done</li>
            <li className="inline-flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/> {overdueCount} overdue</li>
            <li className="inline-flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500"/> Suggest rescheduling tasks due this week</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}


