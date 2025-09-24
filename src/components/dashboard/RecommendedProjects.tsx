"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  commitment: string;
  role_needed?: string;
  required_skills?: string[];
  status: string;
  budget?: number | null;
  deadline?: string | null;
  keywords?: string[] | null;
  author_id: string;
  created_at: string;
};

export default function RecommendedProjects() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<(Project & { matchingScore?: number; reason?: string })[]>([]);
  const [isCached, setIsCached] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: auth } = await supabase.auth.getUser();

        // Call AI endpoint to get top 3 matches (uses cache if available)
        const res = await fetch("/api/ai-tools/recommended-projects", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load recommendations");
        const json = await res.json();
        setProjects((json.projects || []) as (Project & { matchingScore?: number; reason?: string })[]);
        setIsCached(true);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  const emptyState = (
    <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No recommended projects yet</h3>
      <p className="text-gray-600 dark:text-gray-400">Check back later as new projects are posted.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header with gradient (match CoFounders section) */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isCached ? "AI-powered matches (cached)" : "AI-powered matches"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Finding matches...</span>
              </div>
            )}
            <button
              onClick={() => {
                // just refetch cached results
                setIsCached(true);
                // trigger reload
                (async () => {
                  setLoading(true);
                  try {
                    const res = await fetch("/api/ai-tools/recommended-projects", { cache: "no-store" });
                    const json = await res.json();
                    setProjects(json.projects || []);
                  } finally { setLoading(false); }
                })();
              }}
              disabled={loading}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load recommendations</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={() => location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Try Again</button>
        </div>
      ) : projects.length === 0 ? (
        emptyState
      ) : (
        <div className="space-y-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-[#0f172a] bg-opacity-0 dark:bg-opacity-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-5 bg-white dark:bg-[#0f172a]">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {p.title.slice(0,1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Posted {new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="ml-2 inline-flex items-center text-xs text-green-500"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Open now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof p.matchingScore === "number" && (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-600/10 text-emerald-400 border border-emerald-700/30">{p.matchingScore}% Match</span>
                    )}
                    {p.stage && (
                      <span className="px-2 py-1 rounded-full text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-700/30">{p.stage}</span>
                    )}
                    {typeof p.budget === "number" && (
                      <span className="px-2 py-1 rounded-full text-xs bg-amber-600/10 text-amber-400 border border-amber-700/30">Budget ${p.budget.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="mt-3 text-sm text-gray-300 dark:text-gray-300">
                  {(p.description || "").slice(0, 50)}{(p.description || "").length > 50 ? "…" : ""}
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {p.role_needed && <span className="mr-3">Looking for: <span className="text-gray-200">{p.role_needed}</span></span>}
                  <span className="mr-3">Industry: <span className="text-gray-200">{p.industry}</span></span>
                </div>

                {/* Skills pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(p.required_skills || []).slice(0,3).map((s, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md text-xs bg-blue-600/10 text-blue-300 border border-blue-700/30">{s}</span>
                  ))}
                </div>

                {/* Match and reason */}
                <div className="mt-4">
                  {typeof p.matchingScore === "number" && (
                    <div className="flex items-center text-sm text-yellow-400 mb-1">★ <span className="ml-2">{p.matchingScore}% Match</span></div>
                  )}
                  {p.reason && (
                    <div className="flex items-center text-sm text-gray-400"><span className="mr-2">❓</span><span>Why this match? <span className="ml-2 text-gray-300">{p.reason}</span></span></div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button onClick={() => router.push(`/projects/detail/${p.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">View Project</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}


