"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";

type Step = "prepare" | "review";

export interface RiskAssessmentData {
  startupIdea: string;
  industry: string;
  currentStage: string;
  teamSize: string;
  fundingStatus: string;
  targetMarketSize: string;
  competitionLevel: string;
  businessModel: string;
  currentTraction: string;
}

export default function RiskAssessmentClient() {
  const [step, setStep] = useState<Step>("prepare");
  const [assessmentData, setAssessmentData] = useState<RiskAssessmentData>({
    startupIdea: "",
    industry: "",
    currentStage: "Idea Stage",
    teamSize: "Solo Founder",
    fundingStatus: "Bootstrapped",
    targetMarketSize: "Niche Market (under $1B)",
    competitionLevel: "No Direct Competitors",
    businessModel: "SaaS Subscription",
    currentTraction: "",
  });
  const [assessing, setAssessing] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [riskScores, setRiskScores] = useState({
    failureRisk: 0,
    successProbability: 0,
    marketRisk: 0,
    teamRisk: 0,
    financialRisk: 0,
    executionRisk: 0,
  });

  const industries = [
    "FinTech",
    "HealthTech", 
    "EdTech",
    "E-commerce",
    "B2B SaaS",
    "AI/ML",
    "BioTech",
    "CleanTech"
  ];

  const stages = [
    "Idea Stage",
    "MVP Development", 
    "Prototype",
    "Beta Testing",
    "Launched",
    "Growth Stage"
  ];

  const teamSizes = [
    "Solo Founder",
    "2-3 People",
    "4-6 People", 
    "7-10 People",
    "10+ People"
  ];

  const fundingStatuses = [
    "Bootstrapped",
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B+"
  ];

  const marketSizes = [
    "Niche Market (under $1B)",
    "Medium Market ($1B-$10B)",
    "Large Market($10B-$100B)",
    "Massive Market(over $100B)"
  ];

  const competitionLevels = [
    "No Direct Competitors",
    "Few Competitors",
    "Moderate Competition",
    "High Competition",
    "Saturated Market"
  ];

  const businessModels = [
    "SaaS Subscription",
    "Marketplace",
    "E-commerce",
    "Freemium",
    "Advertising",
    "Licensing"
  ];

  // Sync step with URL hash
  useEffect(() => {
    const currentHash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) as Step;
    if (["prepare", "review"].includes(currentHash)) {
      setStep(currentHash);
    } else if (typeof window !== "undefined") {
      // default to prepare if no hash
      window.location.hash = "prepare";
      setStep("prepare");
    }
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "") as Step;
      if (["prepare", "review"].includes(h)) setStep(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = (s: Step) => {
    if (typeof window !== "undefined") {
      window.location.hash = s;
      setStep(s);
    }
  };

  const updateAssessmentData = (field: keyof RiskAssessmentData, value: string) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const handleRunAssessment = async () => {
    try {
      setAssessing(true);
      const res = await fetch("/api/ai-tools/risk-assessment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
      });
      const data = await res.json();
      setAssessmentResults(data.analysis);
      setRiskScores(data.riskScores);
      go("review");
    } catch (error) {
      console.error("Risk assessment failed:", error);
    } finally {
      setAssessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!assessmentResults) return;
    
    try {
      setGeneratingPdf(true);
      const res = await fetch("/api/ai-tools/risk-assessment/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentData,
          assessmentResults,
          riskScores,
        }),
      });
      
      if (!res.ok) throw new Error("PDF generation failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `risk-assessment-${assessmentData.startupIdea.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const Stepper = () => (
    <div className="sticky top-[68px] z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 text-sm">
          {([
            { key: "prepare", label: "Prepare" },
            { key: "review", label: "Review" },
          ] as { key: Step; label: string }[]).map((s, idx, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <button onClick={() => go(s.key)} className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${step === s.key ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>{idx + 1}</button>
              <span className={`text-sm ${step === s.key ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{s.label}</span>
              {idx < arr.length - 1 && <div className="h-px w-10 sm:w-20 bg-gray-200 dark:bg-gray-700" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Risk Assessment</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Predictive analysis of startup risks and success probability scoring</p>
        </div>

        <Stepper />

        {step === "prepare" && (
          <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Startup Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Startup Idea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Startup Idea *
                  </label>
                  <textarea
                    value={assessmentData.startupIdea}
                    onChange={(e) => updateAssessmentData("startupIdea", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your startup idea in detail..."
                    required
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry *
                  </label>
                  <select
                    value={assessmentData.industry}
                    onChange={(e) => updateAssessmentData("industry", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Stage
                  </label>
                  <select
                    value={assessmentData.currentStage}
                    onChange={(e) => updateAssessmentData("currentStage", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size
                  </label>
                  <select
                    value={assessmentData.teamSize}
                    onChange={(e) => updateAssessmentData("teamSize", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {teamSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Funding Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Funding Status
                  </label>
                  <select
                    value={assessmentData.fundingStatus}
                    onChange={(e) => updateAssessmentData("fundingStatus", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {fundingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Market Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Market Size
                  </label>
                  <select
                    value={assessmentData.targetMarketSize}
                    onChange={(e) => updateAssessmentData("targetMarketSize", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {marketSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Competition Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Competition Level
                  </label>
                  <select
                    value={assessmentData.competitionLevel}
                    onChange={(e) => updateAssessmentData("competitionLevel", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {competitionLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Model
                  </label>
                  <select
                    value={assessmentData.businessModel}
                    onChange={(e) => updateAssessmentData("businessModel", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {businessModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Traction */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Traction
                  </label>
                  <textarea
                    value={assessmentData.currentTraction}
                    onChange={(e) => updateAssessmentData("currentTraction", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your current traction, user base, revenue, partnerships, etc..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleRunAssessment}
                  disabled={assessing || !assessmentData.startupIdea.trim() || !assessmentData.industry}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {assessing ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Assessment...
                    </>
                  ) : (
                    "Run AI Risk Assessment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-pink-200 dark:border-pink-800 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 transform rotate-45"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Risk Assessment</h2>
                  </div>
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    PREDICTIVE AI
                  </div>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={generatingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {generatingPdf ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">Advanced AI analysis to predict startup failure risks and success probability</p>

              {/* Main Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Failure Risk Score */}
                <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failure Risk Score</h3>
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">{riskScores.failureRisk}%</div>
                  <div className="text-sm text-green-600 mb-4">
                    {riskScores.failureRisk < 20 ? "Very Low Risk" : 
                     riskScores.failureRisk < 40 ? "Low Risk" :
                     riskScores.failureRisk < 60 ? "Moderate Risk" :
                     riskScores.failureRisk < 80 ? "High Risk" : "Very High Risk"}
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gray-900 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.failureRisk}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Probability of startup failure within 3 years</p>
                </div>

                {/* Success Probability */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Probability</h3>
                  </div>
                  <div className="text-4xl font-bold text-red-600 mb-2">{riskScores.successProbability}%</div>
                  <div className="text-sm text-red-600 mb-4">
                    {riskScores.successProbability > 80 ? "Excellent Outlook" :
                     riskScores.successProbability > 60 ? "Good Outlook" :
                     riskScores.successProbability > 40 ? "Fair Outlook" :
                     riskScores.successProbability > 20 ? "Poor Outlook" : "Very Poor Outlook"}
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gray-900 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.successProbability}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">Likelihood of achieving significant growth</p>
                </div>
              </div>

              {/* Individual Risk Factor Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Market Risk */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Market Risk</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{riskScores.marketRisk}%</div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.marketRisk}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team Risk */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Team Risk</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{riskScores.teamRisk}%</div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.teamRisk}%` }}
                    ></div>
                  </div>
                </div>

                {/* Financial Risk */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Financial Risk</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{riskScores.financialRisk}%</div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.financialRisk}%` }}
                    ></div>
                  </div>
                </div>

                {/* Execution Risk */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Execution Risk</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{riskScores.executionRisk}%</div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${riskScores.executionRisk}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* High-Risk Factors and Risk Mitigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* High-Risk Factors */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 transform rotate-45"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High-Risk Factors</h3>
                  </div>
                  <div className="space-y-2">
                    {riskScores.marketRisk > 50 && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">• Market competition and size challenges</div>
                    )}
                    {riskScores.teamRisk > 50 && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">• Team size and experience limitations</div>
                    )}
                    {riskScores.financialRisk > 50 && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">• Funding and financial sustainability concerns</div>
                    )}
                    {riskScores.executionRisk > 50 && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">• Execution and operational challenges</div>
                    )}
                    {riskScores.marketRisk <= 50 && riskScores.teamRisk <= 50 && riskScores.financialRisk <= 50 && riskScores.executionRisk <= 50 && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">• No significant high-risk factors identified</div>
                    )}
                  </div>
                </div>

                {/* Risk Mitigation */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Mitigation</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">• Develop comprehensive market research strategy</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">• Build strong advisory board and team</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">• Secure adequate funding runway</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">• Implement robust execution framework</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Generate Action Plan
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Get Risk Insurance
                </button>
                <button
                  onClick={() => go("prepare")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  New Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

