"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Globe, Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface GlobalExpansionReport {
  expansionScore: {
    score: number;
    explanation: string;
  };
  topMarkets: Array<{
    country: string;
    region: string;
    score: number;
    opportunities: string[];
    risks: string[];
    marketSize: string;
    competition: string;
    entryEase: string;
  }>;
  localizationNeeds: Array<{
    market: string;
    productAdaptations: string[];
    culturalConsiderations: string[];
    languageRequirements: string[];
  }>;
  regulatoryConsiderations: Array<{
    market: string;
    complianceRequirements: string[];
    legalStructure: string;
    timeline: string;
  }>;
  goToMarketStrategies: Array<{
    market: string;
    entryMode: string;
    marketingChannels: string[];
    partnerships: string[];
    timeline: string;
  }>;
}

export default function GlobalExpansionPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "details") as "details" | "generate" | "review" | "save";

  const [basics, setBasics] = useState({
    title: "",
    description: "",
    industry: "",
    stage: "",
    currentMarket: "",
    businessModel: "",
  });

  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState<string>("");
  const [analysis, setAnalysis] = useState<GlobalExpansionReport | null>(null);
  const [loading, setLoading] = useState(false);

  const goalOptions = [
    "New Customer Acquisition",
    "Cost Reduction",
    "Partnership Development",
    "Market Diversification",
    "Talent Acquisition",
    "Regulatory Arbitrage",
  ];

  const go = (newStep: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set("step", newStep);
    router.push(`/ai-tools/global-expansion?${newParams.toString()}`);
  };

  const toggleGoal = (goal: string) => {
    const next = new Set(goals);
    if (next.has(goal)) {
      next.delete(goal);
    } else {
      next.add(goal);
    }
    setGoals(next);
  };

  const generateAnalysis = async () => {
    if (!basics.title || !basics.description || !basics.industry || goals.size === 0) {
      alert("Please fill in all required fields and select at least one expansion goal.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai-tools/global-expansion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basics,
          goals: Array.from(goals),
          budget,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate analysis");
      }

      const data = await response.json();
      setAnalysis(data);
      go("review");
    } catch (e: unknown) {
      console.error("Analysis generation failed:", e);
      alert(e instanceof Error ? e.message : "Failed to generate analysis");
    } finally {
      setLoading(false);
    }
  };


  const exportPDF = async () => {
    try {
      if (!analysis) return;
      const cleanHTML = `
        <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 8px 0;">AI Global Expansion Report</h1>
          <p style="margin: 0 0 12px 0; color: #333;">${basics.title} — ${basics.industry} • ${basics.stage} • ${basics.currentMarket}</p>
          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Expansion Score</h3>
          <p style="margin:0 0 10px 0;"><strong>${analysis.expansionScore.score}/100</strong> — ${analysis.expansionScore.explanation}</p>

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Top Target Markets</h3>
          ${analysis.topMarkets.map(market => `
            <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px;">${market.country} (${market.region}) - Score: ${market.score}/100</h4>
              <p style="margin: 4px 0;"><strong>Market Size:</strong> ${market.marketSize}</p>
              <p style="margin: 4px 0;"><strong>Competition:</strong> ${market.competition}</p>
              <p style="margin: 4px 0;"><strong>Entry Ease:</strong> ${market.entryEase}</p>
              <p style="margin: 4px 0;"><strong>Opportunities:</strong> ${market.opportunities.join(", ")}</p>
              <p style="margin: 4px 0;"><strong>Risks:</strong> ${market.risks.join(", ")}</p>
            </div>
          `).join('')}

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Localization Needs</h3>
          ${analysis.localizationNeeds.map(loc => `
            <div style="margin-bottom: 12px;">
              <h4 style="margin: 0 0 6px 0; font-size: 14px;">${loc.market}</h4>
              <p style="margin: 2px 0;"><strong>Product Adaptations:</strong> ${loc.productAdaptations.join(", ")}</p>
              <p style="margin: 2px 0;"><strong>Cultural Considerations:</strong> ${loc.culturalConsiderations.join(", ")}</p>
              <p style="margin: 2px 0;"><strong>Language Requirements:</strong> ${loc.languageRequirements.join(", ")}</p>
            </div>
          `).join('')}

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Regulatory Considerations</h3>
          ${analysis.regulatoryConsiderations.map(reg => `
            <div style="margin-bottom: 12px;">
              <h4 style="margin: 0 0 6px 0; font-size: 14px;">${reg.market}</h4>
              <p style="margin: 2px 0;"><strong>Compliance:</strong> ${reg.complianceRequirements.join(", ")}</p>
              <p style="margin: 2px 0;"><strong>Legal Structure:</strong> ${reg.legalStructure}</p>
              <p style="margin: 2px 0;"><strong>Timeline:</strong> ${reg.timeline}</p>
            </div>
          `).join('')}

          <h3 style="font-size: 18px; margin: 16px 0 8px 0;">Go-to-Market Strategies</h3>
          ${analysis.goToMarketStrategies.map(strategy => `
            <div style="margin-bottom: 12px;">
              <h4 style="margin: 0 0 6px 0; font-size: 14px;">${strategy.market}</h4>
              <p style="margin: 2px 0;"><strong>Entry Mode:</strong> ${strategy.entryMode}</p>
              <p style="margin: 2px 0;"><strong>Marketing Channels:</strong> ${strategy.marketingChannels.join(", ")}</p>
              <p style="margin: 2px 0;"><strong>Partnerships:</strong> ${strategy.partnerships.join(", ")}</p>
              <p style="margin: 2px 0;"><strong>Timeline:</strong> ${strategy.timeline}</p>
            </div>
          `).join('')}
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
      pdf.save("global-expansion-report.pdf");
    } catch (e) {
      console.error("PDF export failed", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/ai-tools")}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI Tools
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            Global Expansion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Get AI-powered insights on which markets to expand into first
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {step === "details" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 1 — Project Details</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us about your project and expansion goals.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={basics.title}
                    onChange={(e) => setBasics({ ...basics, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., AI-powered marketing automation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={basics.description}
                    onChange={(e) => setBasics({ ...basics, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your product/service and target customers"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry *
                    </label>
                    <select
                      value={basics.industry}
                      onChange={(e) => setBasics({ ...basics, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Industry</option>
                      <option value="fintech">Fintech</option>
                      <option value="healthtech">Healthtech</option>
                      <option value="edtech">Edtech</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="saas">SaaS</option>
                      <option value="ai-ml">AI/ML</option>
                      <option value="cleantech">Cleantech</option>
                      <option value="biotech">Biotech</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Stage *
                    </label>
                    <select
                      value={basics.stage}
                      onChange={(e) => setBasics({ ...basics, stage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Stage</option>
                      <option value="idea">Idea</option>
                      <option value="mvp">MVP</option>
                      <option value="seed">Seed</option>
                      <option value="growth">Growth</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Market
                    </label>
                    <input
                      type="text"
                      value={basics.currentMarket}
                      onChange={(e) => setBasics({ ...basics, currentMarket: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Model
                    </label>
                    <select
                      value={basics.businessModel}
                      onChange={(e) => setBasics({ ...basics, businessModel: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Model</option>
                      <option value="b2b">B2B</option>
                      <option value="b2c">B2C</option>
                      <option value="b2b2c">B2B2C</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="subscription">Subscription</option>
                      <option value="freemium">Freemium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expansion Goals *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                          goals.has(goal)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expansion Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Budget Range</option>
                    <option value="under-50k">Under $50K</option>
                    <option value="50k-100k">$50K - $100K</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-500k">$250K - $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="over-1m">Over $1M</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={generateAnalysis}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Markets...
                    </>
                  ) : (
                    "Generate Analysis"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analyzing Global Markets</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is evaluating market opportunities, regulatory requirements, and expansion strategies...
              </p>
            </div>
          )}

          {step === "review" && analysis && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 2 — Global Market Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">AI-powered analysis of your expansion opportunities.</p>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expansion Score</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-3xl font-bold text-blue-600">{analysis.expansionScore.score}</span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">/100</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{analysis.expansionScore.explanation}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Target Markets</h3>
                  <div className="space-y-4">
                    {analysis.topMarkets.map((market, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {market.country} ({market.region})
                          </h4>
                          <span className="text-2xl font-bold text-blue-600">{market.score}/100</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Size</span>
                            <p className="text-gray-900 dark:text-white">{market.marketSize}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Competition</span>
                            <p className="text-gray-900 dark:text-white">{market.competition}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Entry Ease</span>
                            <p className="text-gray-900 dark:text-white">{market.entryEase}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Opportunities</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {market.opportunities.map((opp, i) => (
                                <li key={i}>• {opp}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">Risks</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {market.risks.map((risk, i) => (
                                <li key={i}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Localization Needs</h3>
                  <div className="space-y-4">
                    {analysis.localizationNeeds.map((loc, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{loc.market}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Adaptations</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {loc.productAdaptations.map((adapt, i) => (
                                <li key={i}>• {adapt}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cultural Considerations</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {loc.culturalConsiderations.map((consideration, i) => (
                                <li key={i}>• {consideration}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Language Requirements</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {loc.languageRequirements.map((lang, i) => (
                                <li key={i}>• {lang}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Regulatory Considerations</h3>
                  <div className="space-y-4">
                    {analysis.regulatoryConsiderations.map((reg, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{reg.market}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Requirements</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {reg.complianceRequirements.map((req, i) => (
                                <li key={i}>• {req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Legal Structure</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reg.legalStructure}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeline</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reg.timeline}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Go-to-Market Strategies</h3>
                  <div className="space-y-4">
                    {analysis.goToMarketStrategies.map((strategy, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{strategy.market}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Entry Mode</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{strategy.entryMode}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeline</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{strategy.timeline}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Marketing Channels</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {strategy.marketingChannels.map((channel, i) => (
                                <li key={i}>• {channel}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Partnerships</span>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {strategy.partnerships.map((partnership, i) => (
                                <li key={i}>• {partnership}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => go("details")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">
                  Back
                </button>
                <button onClick={() => go("save")} className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "save" && analysis && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 3 — Export Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Download your global expansion report as a PDF document.</p>
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
