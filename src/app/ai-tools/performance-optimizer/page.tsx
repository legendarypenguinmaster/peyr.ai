"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Gauge, Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type ProjectBasics = {
  title: string;
  industry: string;
  stage: string;
  businessModel: string;
};

type Metrics = {
  monthlyActiveUsers: number | "";
  mrr: number | ""; // monthly recurring revenue
  churnRate: number | ""; // % per month
  cac: number | ""; // customer acquisition cost
  ltv: number | ""; // lifetime value
  burnRate: number | ""; // per month
  runwayMonths: number | "";
  engagementScore: number | ""; // arbitrary 0-100
};

type Analysis = {
  kpis: Array<{ name: string; value: string; category: "Growth" | "Retention" | "Finance" }>;
  benchmarks: Array<{ metric: string; yourValue: string; industryAverage: string; status: "ahead" | "on-track" | "behind" }>; 
  suggestions: string[];
  performanceScore: { score: number; explanation: string };
  weeklySummary?: { improved: string[]; worsened: string[]; nextSteps: string[] };
};

type Inputs = {
  basics: ProjectBasics;
  metrics: Metrics;
  goals: string[];
};

const defaultBasics: ProjectBasics = {
  title: "",
  industry: "ai/ml",
  stage: "idea",
  businessModel: "SaaS",
};

const defaultMetrics: Metrics = {
  monthlyActiveUsers: "",
  mrr: "",
  churnRate: "",
  cac: "",
  ltv: "",
  burnRate: "",
  runwayMonths: "",
  engagementScore: "",
};

export default function PerformanceOptimizerPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "select") as "select" | "metrics" | "generate" | "review" | "save";

  const [basics, setBasics] = useState<ProjectBasics>(defaultBasics);
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  

  const go = (s: string) => router.replace(`/ai-tools/performance-optimizer?step=${s}`);

  const toggleGoal = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const generate = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const body: Inputs = { basics, metrics, goals };
      const res = await fetch("/api/ai-tools/performance-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: body }),
      });
      if (!res.ok) throw new Error("Failed to analyze performance");
      const data = await res.json();
      setAnalysis(data.analysis as Analysis);
      go("review");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to analyze performance");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      if (!analysis) return;
      const cleanHTML = `
        <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 8px 0;">AI Performance Report</h1>
          <p style="margin: 0 0 12px 0; color: #333;">${basics.title} — ${basics.industry} • ${basics.stage} • ${basics.businessModel}</p>
          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Performance Score</h3>
          <p style="margin:0 0 10px 0;"><strong>${analysis.performanceScore.score}/100</strong> — ${analysis.performanceScore.explanation}</p>

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">KPIs</h3>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 12px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Category</th>
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">KPI</th>
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Value</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.kpis.map(k => `
                <tr>
                  <td style="border:1px solid #ddd; padding:8px;">${k.category}</td>
                  <td style="border:1px solid #ddd; padding:8px;">${k.name}</td>
                  <td style="border:1px solid #ddd; padding:8px;">${k.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Benchmarks</h3>
          <table style="width:100%; border-collapse: collapse; margin-bottom: 12px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Metric</th>
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Your Value</th>
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Industry Avg</th>
                <th style="border:1px solid #ddd; padding:8px; text-align:left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.benchmarks.map(b => `
                <tr>
                  <td style="border:1px solid #ddd; padding:8px;">${b.metric}</td>
                  <td style="border:1px solid #ddd; padding:8px;">${b.yourValue}</td>
                  <td style="border:1px solid #ddd; padding:8px;">${b.industryAverage}</td>
                  <td style="border:1px solid #ddd; padding:8px;">${b.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Optimization Suggestions</h3>
          <ul style="margin: 0 0 12px 18px;">
            ${analysis.suggestions.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('')}
          </ul>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanHTML;
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-10000px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: "#ffffff", width: 800, height: tempDiv.scrollHeight });
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight, undefined, "FAST");
      } else {
        let remaining = imgHeight;
        const pageDrawHeight = pageHeight - 40;
        while (remaining > 0) {
          const currentPageHeight = Math.min(pageDrawHeight, remaining);
          const sourceY = (imgHeight - remaining) * (canvas.height / imgHeight);
          const sourceHeight = currentPageHeight * (canvas.height / imgHeight);
          const pageCanvas = document.createElement("canvas");
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) break;
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImg = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImg, "PNG", 20, 20, imgWidth, currentPageHeight, undefined, "FAST");
          remaining -= pageDrawHeight;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save("performance-report.pdf");
    } catch (e) {
      console.error("PDF export failed", e);
      alert("Failed to generate PDF. Please try again.");
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
            <Gauge className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Performance Optimizer</h1>
          <p className="text-gray-600 dark:text-gray-400">Track KPIs, benchmark vs. industry, and get actionable optimization advice.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "select" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 1 — Select or Enter Project</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Project Title</label>
                  <input value={basics.title} onChange={(e) => setBasics({ ...basics, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Acme SaaS" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Business Model</label>
                  <select value={basics.businessModel} onChange={(e) => setBasics({ ...basics, businessModel: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>SaaS</option>
                    <option>Marketplace</option>
                    <option>E-commerce</option>
                    <option>Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Industry</label>
                  <select value={basics.industry} onChange={(e) => setBasics({ ...basics, industry: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">Stage</label>
                  <select value={basics.stage} onChange={(e) => setBasics({ ...basics, stage: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option value="idea">Idea</option>
                    <option value="mvp">MVP</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Goals</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Hit $10k MRR", "Grow to 1k users", "Reduce churn", "Extend runway", "Improve engagement"].map((g) => (
                    <label key={g} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${goals.includes(g) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}>
                      <input type="checkbox" checked={goals.includes(g)} onChange={() => toggleGoal(g)} />
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => router.back()} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("metrics")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Next</button>
              </div>
            </div>
          )}

          {step === "metrics" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 2 — Enter Current Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { key: "monthlyActiveUsers", label: "Monthly Active Users" },
                  { key: "mrr", label: "MRR ($)" },
                  { key: "churnRate", label: "Churn Rate (%)" },
                  { key: "cac", label: "CAC ($)" },
                  { key: "ltv", label: "LTV ($)" },
                  { key: "burnRate", label: "Burn Rate ($/mo)" },
                  { key: "runwayMonths", label: "Runway (months)" },
                  { key: "engagementScore", label: "Engagement (0–100)" },
                ] as Array<{ key: keyof Metrics; label: string }>).map((f) => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-700 dark:text-gray-300">{f.label}</label>
                    <input
                      type="number"
                      value={metrics[f.key] as number | ""}
                      onChange={(e) => setMetrics({ ...metrics, [f.key]: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => go("select")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("generate")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Analyze</button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing KPIs and benchmarks...</p>
              <div className="mt-6 flex items-center justify-center">
                <button onClick={() => go("metrics")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
              {(() => {
                if (!loading) generate();
                return null;
              })()}
            </div>
          )}

          {step === "review" && analysis && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 3 — KPI Dashboard & Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {analysis.kpis.map((kpi, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{kpi.category}</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{kpi.name}</div>
                    <div className="text-blue-600 dark:text-blue-400 mt-1">{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Benchmarks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Metric</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Your Value</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Industry Avg</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.benchmarks.map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">{b.metric}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">{b.yourValue}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">{b.industryAverage}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Optimization Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-800 dark:text-gray-200">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
                <div className="text-blue-900 dark:text-blue-100 font-semibold">Performance Score: {analysis.performanceScore.score}/100</div>
                <div className="text-blue-700 dark:text-blue-300 text-sm mt-1">{analysis.performanceScore.explanation}</div>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => go("metrics")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("save")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Continue</button>
              </div>
            </div>
          )}

          {step === "save" && analysis && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 4 — Download Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Download your AI performance report as a PDF document.</p>
              <div className="flex justify-between">
                <button onClick={() => go("review")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={exportPDF} className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer"><Download className="w-4 h-4 mr-2" /> Download</button>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}


