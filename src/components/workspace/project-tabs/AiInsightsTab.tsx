"use client";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

export default function AiInsightsTab({ progressPct, overdueCount }: { progressPct: number; overdueCount: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Ask AI</button>
          <button className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white">Generate Report</button>
        </div>
      </div>
      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <li>Forecast: You are {progressPct}% on track.</li>
        <li>Bottleneck: {overdueCount} overdue task{overdueCount!==1?'s':''} detected.</li>
        <li>Recommendation: Shift one task from To Do to In Progress.</li>
      </ul>
    </Card>
  );
}


