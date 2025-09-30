"use client";

import { useState } from "react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

// interface InsightItem { label: string; value: string; }

export default function AiInsightsTab({ progressPct, overdueCount, workspaceId, projectId }: { progressPct: number; overdueCount: number; workspaceId?: string; projectId?: string }) {
  // const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<string>(`You're ${progressPct}% on track, ${overdueCount} overdue.`);
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const askAI = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/ai-tools/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, projectId, progressPct, overdueCount, model: 'gpt-4o' })
      });
      if (!res.ok) throw new Error('Failed to get insights');
      const data = await res.json();
      setForecast(data.forecast || forecast);
      setBottlenecks(data.bottlenecks || []);
      setRecommendations(data.recommendations || []);
      setReportUrl(data.reportUrl || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally { setLoading(false); }
  };

  const generateReport = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/ai-tools/insights/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, projectId, model: 'gpt-4o' })
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investor-report-${projectId || 'project'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally { setLoading(false); }
  };

  // removed client-side md rendering

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        <div className="flex items-center gap-2">
          <button onClick={askAI} disabled={loading} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60">{loading ? 'Thinking…' : 'Ask AI'}</button>
          <button onClick={generateReport} disabled={loading} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white disabled:opacity-60">Generate Report</button>
        </div>
      </div>
      {error && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>}
      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <div><span className="font-semibold">Progress Forecasting:</span> {forecast}</div>
        <div>
          <div className="font-semibold">Bottleneck Alerts:</div>
          <ul className="list-disc pl-5">
            {(bottlenecks.length ? bottlenecks : [overdueCount ? `${overdueCount} overdue tasks detected.` : 'No bottlenecks detected.']).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold">Strategy Recommendations:</div>
          <ul className="list-disc pl-5">
            {(recommendations.length ? recommendations : ['Review milestones, prepare pitch deck after MVP.']).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        {reportUrl && (
          <div>
            <div className="font-semibold">Investor Report:</div>
            <a href={reportUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline">Open report</a>
          </div>
        )}
      </div>
    </Card>
  );
}



