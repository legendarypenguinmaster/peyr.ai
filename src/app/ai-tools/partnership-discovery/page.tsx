"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Handshake, Loader2, Mail } from "lucide-react";

type Goal = "distribution" | "integration" | "research" | "corporate";

type Inputs = {
  projectTitle: string;
  projectDescription: string;
  industry: string;
  targetMarket: string;
  goals: Set<Goal>;
  attachProjectId: string;
};

type Partner = {
  name: string;
  type: "Tech" | "Distribution" | "Research" | "Corporate";
  description: string;
  relevance: string;
  synergies: string[];
  risks: string[];
  score: number;
  explanation: string;
  website?: string;
};

type Report = {
  partners: Partner[];
  summary: string[];
};

const defaultInputs: Inputs = {
  projectTitle: "",
  projectDescription: "",
  industry: "ai/ml",
  targetMarket: "",
  goals: new Set(),
  attachProjectId: "",
};

export default function PartnershipDiscoveryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "input") as
    | "input"
    | "generate"
    | "review"
    | "save"
    | "outreach";

  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const go = (s: string) => router.replace(`/ai-tools/partnership-discovery?step=${s}`);

  const toggleGoal = (goal: Goal) => {
    setInputs((prev) => {
      const next = new Set(prev.goals);
      if (next.has(goal)) next.delete(goal); else next.add(goal);
      return { ...prev, goals: next };
    });
  };

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/ai-tools/partnership-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { ...inputs, goals: Array.from(inputs.goals) } }),
      });
      if (!res.ok) throw new Error("Failed to generate partnership report");
      const data = await res.json();
      setReport(data.report);
      go("review");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to generate partnership report");
    } finally {
      setLoading(false);
    }
  };

  const draftOutreach = async (partner: Partner) => {
    try {
      const res = await fetch("/api/ai-tools/partnership-discovery/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { ...inputs, goals: Array.from(inputs.goals) }, partner }),
      });
      if (!res.ok) throw new Error("Failed to draft outreach");
      const data = await res.json();
      const blob = new Blob([data.email], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outreach-${partner.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to draft outreach");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => history.back()} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group cursor-pointer">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Partnership Discovery</h1>
          <p className="text-gray-600 dark:text-gray-400">Find partners for distribution, integration, research, and corporate pilots.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "input" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 1 — Project Details & Goals</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Project Title *</label>
                  <input type="text" value={inputs.projectTitle} onChange={(e) => setInputs({ ...inputs, projectTitle: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g., AI Payments Automation" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Project Description *</label>
                  <textarea value={inputs.projectDescription} onChange={(e) => setInputs({ ...inputs, projectDescription: e.target.value })} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Describe your project" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Industry</label>
                    <select value={inputs.industry} onChange={(e) => setInputs({ ...inputs, industry: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <option value="fintech">Fintech</option>
                      <option value="healthtech">Healthtech</option>
                      <option value="edtech">Edtech</option>
                      <option value="e-commerce">E-commerce</option>
                      <option value="ai/ml">AI/ML</option>
                      <option value="biotech">Biotech</option>
                      <option value="cleantech">Cleantech</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Target Market</label>
                    <input type="text" value={inputs.targetMarket} onChange={(e) => setInputs({ ...inputs, targetMarket: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="e.g., SMB e-commerce" />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Partnership Goals *</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {([
                      { key: "distribution", label: "Distribution (reach customers faster)" },
                      { key: "integration", label: "Tech integration (APIs, platforms)" },
                      { key: "research", label: "Research/innovation (labs, universities)" },
                      { key: "corporate", label: "Corporate pilots (enterprises)" },
                    ] as Array<{ key: Goal; label: string }>).map((item) => (
                      <label key={item.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${inputs.goals.has(item.key) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                        <input type="checkbox" checked={inputs.goals.has(item.key)} onChange={() => toggleGoal(item.key)} />
                        <span className="text-gray-800 dark:text-gray-200 text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => router.back()} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("generate")} disabled={!inputs.projectTitle || !inputs.projectDescription || inputs.goals.size === 0} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Generate</button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Finding potential partners and analyzing fit...</p>
              <div className="mt-6 flex items-center justify-center">
                <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
              {(() => {
                if (!loading) generate();
                return null;
              })()}
            </div>
          )}

          {step === "review" && report && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 2 — Partnership Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Top suggested partners, fit analysis, and partnership types.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.partners.map((partner, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{partner.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{partner.type}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{partner.description}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2"><strong>Relevance:</strong> {partner.relevance}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Synergies</div>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          {partner.synergies.map((s, i) => (
                            <li key={i} className="flex items-start"><span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2"></span>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Risks</div>
                        <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                          {partner.risks.map((r, i) => (
                            <li key={i} className="flex items-start"><span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2"></span>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">Score: {partner.score}/100</div>
                      <button onClick={() => draftOutreach(partner)} className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm cursor-pointer"><Mail className="w-4 h-4 mr-1" /> Draft Outreach</button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{partner.explanation}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("outreach")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Next: Outreach Email</button>
              </div>
            </div>
          )}

          {step === "outreach" && report && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 3 — Draft Outreach Email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Select a partner above and click Draft Outreach to generate a tailored email. The email will download as a .txt file you can customize.</p>
              <div className="flex justify-between">
                <button onClick={() => go("review")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


