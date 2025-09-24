"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Calculator, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Inputs = {
  businessModel: string;
  pricingModel: string;
  year1Customers: number | "";
  monthlyGrowthRate: number | ""; // %
  churnRate: number | ""; // %
  fixedCosts: { label: string; amount: number | "" }[];
  variableCosts: { label: string; amount: number | "" }[];
  fundingGoal: number | "";
};

type Model = {
  summary: {
    burnRate: number;
    runwayMonths: number;
    ltv: number;
    cac: number;
    grossMargin: number; // %
  };
  yearly: Array<{ year: number; revenue: number; costs: number; ebitda: number }>;
  notes: string[];
};

const defaultInputs: Inputs = {
  businessModel: "SaaS",
  pricingModel: "subscription",
  year1Customers: 200,
  monthlyGrowthRate: 10,
  churnRate: 3,
  fixedCosts: [
    { label: "Team salaries", amount: 15000 },
    { label: "Rent/office", amount: 1000 },
  ],
  variableCosts: [
    { label: "Servers", amount: 800 },
    { label: "Marketing", amount: 2000 },
  ],
  fundingGoal: 250000,
};

export default function FinancialModelingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "input") as
    | "input"
    | "assumptions"
    | "generate"
    | "review";

  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<Model | null>(null);

  const go = (s: string) => router.replace(`/ai-tools/financial-modeling?step=${s}`);
  const restart = () => {
    setInputs(defaultInputs);
    setModel(null);
    go("input");
  };

  const exportCSV = () => {
    if (!model) return;
    const header = ["Year", "Revenue", "Costs", "EBITDA"];
    const rows = model.yearly.map((y) => [y.year, y.revenue, y.costs, y.ebitda]);
    const lines = [header.join(","), ...rows.map((r) => r.join(","))];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-model-yearly.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFixedChange = (idx: number, key: "label" | "amount", value: string) => {
    setInputs((prev) => {
      const next = [...prev.fixedCosts];
      // @ts-expect-error safe conversion
      next[idx][key] = key === "amount" ? Number(value || 0) : value;
      return { ...prev, fixedCosts: next };
    });
  };

  const handleVariableChange = (idx: number, key: "label" | "amount", value: string) => {
    setInputs((prev) => {
      const next = [...prev.variableCosts];
      // @ts-expect-error safe conversion
      next[idx][key] = key === "amount" ? Number(value || 0) : value;
      return { ...prev, variableCosts: next };
    });
  };

  const generate = async () => {
    setLoading(true);
    setModel(null);
    try {
      const res = await fetch("/api/ai-tools/financial-modeling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      if (!res.ok) throw new Error("Failed to generate model");
      const data = await res.json();
      setModel(data.model);
      go("review");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to generate model");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      if (!model) return;
      
      // Create clean HTML without any modern CSS
      const cleanHTML = `
        <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 20px 0; color: #000;">AI Financial Model</h1>
          
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f0f8f0; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #006600; font-size: 16px;">Summary</h3>
            <p style="margin: 0; font-size: 14px; color: #333;">
              Burn $${model.summary.burnRate.toLocaleString()} / month • 
              Runway ${model.summary.runwayMonths} months • 
              LTV $${model.summary.ltv.toLocaleString()} • 
              CAC $${model.summary.cac.toLocaleString()} • 
              Gross margin ${model.summary.grossMargin}%
            </p>
          </div>
          
          <h3 style="font-size: 18px; margin: 20px 0 15px 0; color: #000;">5-Year Financial Projections</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Year</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Revenue</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Costs</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">EBITDA</th>
              </tr>
            </thead>
            <tbody>
              ${model.yearly.map(y => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">Year ${y.year}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${y.revenue.toLocaleString()}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${y.costs.toLocaleString()}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${y.ebitda.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${model.notes?.length > 0 ? `
            <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #000;">Notes</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${model.notes.map(n => `<li style="margin-bottom: 5px; font-size: 14px;">${n}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
      
      // Create temporary container
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanHTML;
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-10000px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: 800,
        height: tempDiv.scrollHeight
      });
      
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
        // Simple pagination
        let remaining = imgHeight;
        const pageDrawHeight = pageHeight - 40;
        let y = 20;
        
        while (remaining > 0) {
          const currentPageHeight = Math.min(pageDrawHeight, remaining);
          const sourceY = (imgHeight - remaining) * (canvas.height / imgHeight);
          const sourceHeight = currentPageHeight * (canvas.height / imgHeight);
          
          const pageCanvas = document.createElement("canvas");
          const context = pageCanvas.getContext("2d");
          if (!context) return;
          
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          
          context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImg = pageCanvas.toDataURL("image/png");
          
          pdf.addImage(pageImg, "PNG", 20, y, imgWidth, currentPageHeight, undefined, "FAST");
          
          remaining -= pageDrawHeight;
          if (remaining > 0) {
            pdf.addPage();
            y = 20;
          }
        }
      }
      
      pdf.save("financial-model.pdf");
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
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Financial Modeling</h1>
          <p className="text-gray-600 dark:text-gray-400">Auto-generate 3–5 year projections, burn, runway, and unit economics.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "input" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 1 — Business Basics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Business model</label>
                  <select value={inputs.businessModel} onChange={(e) => setInputs({ ...inputs, businessModel: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>SaaS</option>
                    <option>Marketplace</option>
                    <option>E-commerce</option>
                    <option>Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Pricing model</label>
                  <select value={inputs.pricingModel} onChange={(e) => setInputs({ ...inputs, pricingModel: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <option>subscription</option>
                    <option>transaction fee</option>
                    <option>one-time</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Year 1 customers/users</label>
                  <input type="number" value={inputs.year1Customers} onChange={(e) => setInputs({ ...inputs, year1Customers: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Funding goal ($)</label>
                  <input type="number" value={inputs.fundingGoal} onChange={(e) => setInputs({ ...inputs, fundingGoal: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => router.back()} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => router.replace("/ai-tools/financial-modeling?step=assumptions")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Next</button>
              </div>
            </div>
          )}

          {step === "assumptions" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 2 — Assumptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Monthly growth rate (%)</label>
                  <input type="number" value={inputs.monthlyGrowthRate} onChange={(e) => setInputs({ ...inputs, monthlyGrowthRate: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Churn rate (%)</label>
                  <input type="number" value={inputs.churnRate} onChange={(e) => setInputs({ ...inputs, churnRate: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-2">Fixed costs (monthly)</div>
                  {inputs.fixedCosts.map((c, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={c.label} onChange={(e) => handleFixedChange(i, "label", e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                      <input type="number" value={c.amount} onChange={(e) => handleFixedChange(i, "amount", e.target.value)} placeholder="Amount" className="w-40 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                  ))}
                  <button onClick={() => setInputs({ ...inputs, fixedCosts: [...inputs.fixedCosts, { label: "", amount: 0 }] })} className="mt-2 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer">Add fixed cost</button>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-2">Variable costs (monthly)</div>
                  {inputs.variableCosts.map((c, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={c.label} onChange={(e) => handleVariableChange(i, "label", e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                      <input type="number" value={c.amount} onChange={(e) => handleVariableChange(i, "amount", e.target.value)} placeholder="Amount" className="w-40 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                  ))}
                  <button onClick={() => setInputs({ ...inputs, variableCosts: [...inputs.variableCosts, { label: "", amount: 0 }] })} className="mt-2 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer">Add variable cost</button>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("generate")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Generate</button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Generating your financial model...</p>
              <div className="mt-6 flex items-center justify-center">
                <button onClick={() => go("assumptions")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
              {(() => {
                // auto trigger
                if (!loading) generate();
                return null;
              })()}
            </div>
          )}

          {step === "review" && model && (
            <div id="fm-review">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 4 — Review</h2>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
                <div className="text-green-700 dark:text-green-300 font-medium">Summary</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">Burn ${model.summary.burnRate.toLocaleString()} / month • Runway {model.summary.runwayMonths} months • LTV ${model.summary.ltv.toLocaleString()} • CAC ${model.summary.cac.toLocaleString()} • Gross margin {model.summary.grossMargin}%</div>
              </div>
              
              {/* 5-Year Financial Projections Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">5-Year Financial Projections</h3>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Line
                    data={{
                      labels: model.yearly.map(y => `Year ${y.year}`),
                      datasets: [
                        {
                          label: 'Revenue',
                          data: model.yearly.map(y => y.revenue),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          tension: 0.1,
                        },
                        {
                          label: 'Costs',
                          data: model.yearly.map(y => y.costs),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.1,
                        },
                        {
                          label: 'EBITDA',
                          data: model.yearly.map(y => y.ebitda),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: {
                            color: '#6B7280',
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context: TooltipItem<'line'>) {
                              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: '#E5E7EB',
                          },
                          ticks: {
                            color: '#6B7280',
                          },
                        },
                        y: {
                          grid: {
                            color: '#E5E7EB',
                          },
                          ticks: {
                            color: '#6B7280',
                            callback: function(value: number | string) {
                              return '$' + Number(value as number).toLocaleString();
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {model.yearly.map((y) => (
                  <div key={y.year} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                    <div className="text-gray-900 dark:text-white font-medium">Year {y.year}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">Revenue ${y.revenue.toLocaleString()} • Costs ${y.costs.toLocaleString()} • EBITDA ${y.ebitda.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {model.notes?.length > 0 && (
                <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-medium mb-1">Notes</div>
                  <ul className="list-disc ml-5">
                    {model.notes.map((n, i) => (<li key={i}>{n}</li>))}
                  </ul>
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  <button onClick={() => go("assumptions")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                  <button onClick={restart} className="px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 cursor-pointer">Restart</button>
                </div>
                <div className="flex gap-3">
                  <button onClick={exportCSV} className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer">Download CSV</button>
                  <button onClick={exportPDF} className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer"><Download className="w-4 h-4 mr-2" /> Download PDF</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


