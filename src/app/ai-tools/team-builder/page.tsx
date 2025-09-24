"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Check, Users, Plus, Loader2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
};

type RoleInput = { id: string; name: string; skills: string[] };

export default function TeamBuilderPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const step = (params.get("step") || "select-project") as "select-project" | "enter-info" | "result";

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleInput[]>([{ id: crypto.randomUUID(), name: "", skills: [] }]);
  const [analysis, setAnalysis] = useState<{ suggestions: string[]; summary: string } | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("projects")
          .select("id,title,description,industry,stage")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProjects((data || []) as unknown as Project[]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [supabase]);

  const go = (s: string) => router.replace(`/ai-tools/team-builder?step=${s}`);

  const addRole = () => setRoles((r) => [...r, { id: crypto.randomUUID(), name: "", skills: [] }]);
  const removeRole = (id: string) => setRoles((r) => r.filter((x) => x.id !== id));
  const updateRoleName = (id: string, name: string) => setRoles((r) => r.map((x) => (x.id === id ? { ...x, name } : x)));
  const addSkill = (id: string, skill: string) => setRoles((r) => r.map((x) => (x.id === id ? { ...x, skills: Array.from(new Set([...(x.skills || []), skill.trim()])).filter(Boolean) } : x)));
  const removeSkill = (id: string, skill: string) => setRoles((r) => r.map((x) => (x.id === id ? { ...x, skills: (x.skills || []).filter((s) => s !== skill) } : x)));

  const analyze = async () => {
    if (!selectedProject) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai-tools/team-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject.id, roles }),
      });
      if (!res.ok) throw new Error("Failed to analyze team");
      const data = await res.json();
      setAnalysis(data);
      go("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => history.back()} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Team Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan your ideal founding team and discover missing roles.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "select-project" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select a Project</h2>
              {loading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
              ) : projects.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400">No projects found. Create a project first.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <button key={p.id} onClick={() => setSelectedProject(p)} className={`text-left border-2 rounded-xl p-5 hover:shadow transition ${selectedProject?.id === p.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                      <div className="font-semibold text-gray-900 dark:text-white">{p.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{p.industry} • {p.stage}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{p.description}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button disabled={!selectedProject} onClick={() => go("enter-info")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {step === "enter-info" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Enter Current Roles</h2>
              <div className="space-y-4">
                {roles.map((r, idx) => (
                  <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <input value={r.name} onChange={(e) => updateRoleName(r.id, e.target.value)} placeholder={`Role ${idx + 1} (e.g., Backend Engineer)`} className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                      {roles.length > 1 && (
                        <button onClick={() => removeRole(r.id)} className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Remove</button>
                      )}
                    </div>
                    <div className="mt-3">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Skills (type and press Enter)</label>
                      <SkillInput value={r.skills} onAdd={(s) => addSkill(r.id, s)} onRemove={(s) => removeSkill(r.id, s)} />
                    </div>
                  </div>
                ))}
                <button onClick={addRole} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"><Plus className="w-4 h-4 mr-2" />Add another role</button>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => go("select-project")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Back</button>
                <button onClick={analyze} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">Analyze Team</button>
              </div>
            </div>
          )}

          {step === "result" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Suggested Roles</h2>
              {loading && (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /><p className="mt-2 text-gray-600 dark:text-gray-400">Analyzing your project and team...</p></div>
              )}
              {error && <div className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</div>}
              {analysis && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="text-green-700 dark:text-green-300 font-medium">Summary</div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">{analysis.summary}</div>
                  </div>
                  <div className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="text-gray-800 dark:text-gray-200 text-sm">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillInput({ value, onAdd, onRemove }: { value: string[]; onAdd: (s: string) => void; onRemove: (s: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = text.trim();
            if (v) onAdd(v);
            setText("");
          }
        }}
        placeholder="Type a skill and press Enter"
        className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((s) => (
          <span key={s} className="px-2 py-1 rounded-md text-xs bg-blue-600/10 text-blue-300 border border-blue-700/30">
            {s}
            <button onClick={() => onRemove(s)} className="ml-2 text-blue-300 hover:text-blue-100">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}


