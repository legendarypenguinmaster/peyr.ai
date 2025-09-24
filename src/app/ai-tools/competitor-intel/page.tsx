"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Search, Download, Loader2, Target, TrendingUp, Users } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type IntelInputs = {
  title: string;
  description: string;
  targetCustomers: string;
  industry: string;
  keywords: string[];
  businessModel: string;
  stage: string;
};

type Competitor = {
  name: string;
  description: string;
  businessModel: string;
  fundingStage: string;
  strengths: string[];
  weaknesses: string[];
  website?: string;
};

type FeatureComparison = {
  feature: string;
  competitors: { [key: string]: boolean };
};

type IntelResult = {
  competitors: Competitor[];
  featureComparison: FeatureComparison[];
  positioning: {
    opportunities: string[];
    differentiation: string[];
    recommendations: string[];
  };
  intelScore: {
    score: number;
    level: string;
    explanation: string;
  };
  marketInsights: string[];
};

const defaultInputs: IntelInputs = {
  title: "",
  description: "",
  targetCustomers: "",
  industry: "ai/ml",
  keywords: [],
  businessModel: "SaaS",
  stage: "idea",
};

export default function CompetitorIntelPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "input") as
    | "input"
    | "confirm"
    | "generate"
    | "review"
    | "export";

  const [inputs, setInputs] = useState<IntelInputs>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<IntelResult | null>(null);

  const go = (s: string) => router.replace(`/ai-tools/competitor-intel?step=${s}`);

  const restart = () => {
    setInputs(defaultInputs);
    setIntel(null);
    go("input");
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !inputs.keywords.includes(keyword.trim())) {
      setInputs(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setInputs(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const generateIntel = async () => {
    setLoading(true);
    setIntel(null);
    try {
      const res = await fetch("/api/ai-tools/competitor-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      if (!res.ok) throw new Error("Failed to generate competitor intel");
      const data = await res.json();
      setIntel(data.intel);
      go("review");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to generate competitor intel");
    } finally {
      setLoading(false);
    }
  };


  const exportPDF = async () => {
    try {
      if (!intel) return;
      
      const cleanHTML = `
        <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 20px 0; color: #000;">Competitor Intel Report</h1>
          <h2 style="font-size: 20px; margin: 0 0 15px 0; color: #333;">${inputs.title}</h2>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">${inputs.description}</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f8f9fa; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Intel Score</h3>
            <p style="margin: 0; font-size: 14px;"><strong>${intel.intelScore.score}/100 - ${intel.intelScore.level}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${intel.intelScore.explanation}</p>
          </div>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Competitor Profiles</h3>
          ${intel.competitors.map(competitor => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${competitor.name}</h4>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">${competitor.description}</p>
              <div style="display: flex; gap: 20px; margin-bottom: 10px;">
                <span style="font-size: 12px;"><strong>Model:</strong> ${competitor.businessModel}</span>
                <span style="font-size: 12px;"><strong>Funding:</strong> ${competitor.fundingStage}</span>
              </div>
              <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #28a745;">Strengths:</p>
                  <ul style="margin: 0; padding-left: 15px; font-size: 12px;">
                    ${competitor.strengths.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #dc3545;">Weaknesses:</p>
                  <ul style="margin: 0; padding-left: 15px; font-size: 12px;">
                    ${competitor.weaknesses.map(w => `<li>${w}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `).join('')}
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Feature Comparison</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Feature</th>
                ${intel.competitors.map(c => `<th style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${intel.featureComparison.map(feature => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${feature.feature}</td>
                  ${intel.competitors.map(comp => `
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                      ${feature.competitors[comp.name] ? '✓' : '✗'}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Market Positioning</h3>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Opportunities</h4>
            <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 14px;">
              ${intel.positioning.opportunities.map(opp => `<li>${opp}</li>`).join('')}
            </ul>
            <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Differentiation</h4>
            <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 14px;">
              ${intel.positioning.differentiation.map(diff => `<li>${diff}</li>`).join('')}
            </ul>
            <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Recommendations</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              ${intel.positioning.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Market Insights</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${intel.marketInsights.map(insight => `<li style="margin-bottom: 5px; font-size: 14px;">${insight}</li>`).join('')}
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
      
      pdf.save("competitor-intel-report.pdf");
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
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Competitor Intel</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover competitors, analyze features, and find market positioning opportunities.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "input" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 1 — Project Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Product/Service Title *</label>
                  <input 
                    type="text" 
                    value={inputs.title} 
                    onChange={(e) => setInputs({ ...inputs, title: e.target.value })} 
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Enter your product or service name"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Description *</label>
                  <textarea 
                    value={inputs.description} 
                    onChange={(e) => setInputs({ ...inputs, description: e.target.value })} 
                    rows={4}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Describe what your product/service does"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Target Customers *</label>
                  <textarea 
                    value={inputs.targetCustomers} 
                    onChange={(e) => setInputs({ ...inputs, targetCustomers: e.target.value })} 
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Who are your target customers?"
                  />
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
                    <label className="text-sm text-gray-700 dark:text-gray-300">Business Model</label>
                    <select value={inputs.businessModel} onChange={(e) => setInputs({ ...inputs, businessModel: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <option value="SaaS">SaaS</option>
                      <option value="Marketplace">Marketplace</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Services">Services</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Mobile App">Mobile App</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Keywords</label>
                  <div className="mt-1 flex flex-wrap gap-2 mb-2">
                    {inputs.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {keyword}
                        <button onClick={() => removeKeyword(keyword)} className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add keyword" 
                      className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addKeyword(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add keyword"]') as HTMLInputElement;
                        if (input) {
                          addKeyword(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button onClick={() => router.back()} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button 
                  onClick={() => go("confirm")} 
                  disabled={!inputs.title || !inputs.description || !inputs.targetCustomers}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 2 — Confirm Analysis Parameters</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Analysis Summary</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Product:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.title}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Description:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.description}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Target Customers:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.targetCustomers}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Industry:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.industry}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Business Model:</span>
                    <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.businessModel}</span>
                  </div>
                  {inputs.keywords.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Keywords:</span>
                      <span className="ml-2 text-blue-800 dark:text-blue-200">{inputs.keywords.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("generate")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Generate Intel</button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing competitors and generating intelligence report...</p>
              <div className="mt-6 flex items-center justify-center">
                <button onClick={() => go("confirm")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
              {(() => {
                if (!loading) generateIntel();
                return null;
              })()}
            </div>
          )}

          {step === "review" && intel && (
            <div id="intel-review">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 3 — Competitor Intel Report</h2>
              
              {/* Intel Score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Intel Score</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{intel.intelScore.explanation}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{intel.intelScore.score}/100</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{intel.intelScore.level}</div>
                  </div>
                </div>
              </div>

              {/* Competitors */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Competitor Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intel.competitors.map((competitor, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{competitor.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{competitor.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span><strong>Model:</strong> {competitor.businessModel}</span>
                        <span><strong>Funding:</strong> {competitor.fundingStage}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Strengths</p>
                          <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                            {competitor.strengths.map((strength, sIndex) => (
                              <li key={sIndex} className="flex items-start">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Weaknesses</p>
                          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                            {competitor.weaknesses.map((weakness, wIndex) => (
                              <li key={wIndex} className="flex items-start">
                                <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Comparison */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Feature</th>
                        {intel.competitors.map((comp, index) => (
                          <th key={index} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-900 dark:text-white">{comp.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {intel.featureComparison.map((feature, fIndex) => (
                        <tr key={fIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">{feature.feature}</td>
                          {intel.competitors.map((comp, cIndex) => (
                            <td key={cIndex} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                              <span className={`text-lg ${feature.competitors[comp.name] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {feature.competitors[comp.name] ? '✓' : '✗'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Market Positioning */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Positioning</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {intel.positioning.opportunities.map((opp, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-green-800 dark:text-green-200">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Differentiation
                    </h4>
                    <ul className="space-y-2">
                      {intel.positioning.differentiation.map((diff, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-blue-800 dark:text-blue-200">{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {intel.positioning.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span className="text-purple-800 dark:text-purple-200">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Market Insights</h3>
                <ul className="space-y-2">
                  {intel.marketInsights.map((insight, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-800 dark:text-gray-200">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  <button onClick={() => go("confirm")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                  <button onClick={restart} className="px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 cursor-pointer">Restart</button>
                </div>
                <button onClick={() => go("export")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Export Report</button>
              </div>
            </div>
          )}

          {step === "export" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 4 — Export Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Download your competitor intel report as a PDF document.</p>
              <div className="flex justify-between">
                <button onClick={() => go("review")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={exportPDF} className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
