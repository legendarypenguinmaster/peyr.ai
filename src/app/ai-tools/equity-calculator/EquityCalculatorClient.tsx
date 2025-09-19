"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";

type Step = "prepare" | "result";

export interface Founder {
  id: string;
  name: string;
  primary: string;
  capitalContribution: number;
  experienceLevel: string;
  timeCommitment: number;
  salaryForegone: number;
  riskLevel: string;
  networkValue: string;
}

export default function EquityCalculatorClient() {
  const [step, setStep] = useState<Step>("prepare");
  const [founders, setFounders] = useState<Founder[]>([
    {
      id: "1",
      name: "",
      primary: "CEO / Business Lead",
      capitalContribution: 0,
      experienceLevel: "First-time Entrepreneur",
      timeCommitment: 100,
      salaryForegone: 0,
      riskLevel: "Medium Risk (Some savings)",
      networkValue: "Moderate Network",
    },
  ]);
  const [calculating, setCalculating] = useState(false);
  const [equityResults, setEquityResults] = useState<{
    founders?: Array<{
      name: string;
      primary: string;
      capitalContribution: number;
      experienceLevel: string;
      timeCommitment: number;
      equityPercentage: number;
    }>;
    analysis?: string;
  } | null>(null);

  // Sync step with URL hash
  useEffect(() => {
    const currentHash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) as Step;
    if (currentHash === "prepare" || currentHash === "result") {
      setStep(currentHash);
    } else if (typeof window !== "undefined") {
      // default to prepare if no hash
      window.location.hash = "prepare";
      setStep("prepare");
    }
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "") as Step;
      if (h === "prepare" || h === "result") setStep(h);
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

  const addFounder = () => {
    const newFounder: Founder = {
      id: Date.now().toString(),
      name: "",
      primary: "CEO / Business Lead",
      capitalContribution: 0,
      experienceLevel: "First-time Entrepreneur",
      timeCommitment: 100,
      salaryForegone: 0,
      riskLevel: "Medium Risk (Some savings)",
      networkValue: "Moderate Network",
    };
    setFounders([...founders, newFounder]);
  };

  const removeFounder = (id: string) => {
    if (founders.length > 1) {
      setFounders(founders.filter(f => f.id !== id));
    }
  };

  const updateFounder = (id: string, field: keyof Founder, value: string | number) => {
    setFounders(founders.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const res = await fetch("/api/ai-tools/equity-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founders }),
      });
      const json = await res.json();
      setEquityResults(json);
      go("result");
    } catch (error) {
      console.error("Equity calculation failed:", error);
    } finally {
      setCalculating(false);
    }
  };

  const Stepper = () => (
    <div className="sticky top-[68px] z-10 bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 text-sm">
          {([
            { key: "prepare", label: "Founder Data" },
            { key: "result", label: "Equity Results" },
          ] as { key: Step; label: string }[]).map((s, idx, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <button onClick={() => go(s.key)} className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${step === s.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>{idx + 1}</button>
              <span className={`text-sm ${step === s.key ? "text-gray-900" : "text-gray-500"}`}>{s.label}</span>
              {idx < arr.length - 1 && <div className="h-px w-10 sm:w-20 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Equity Calculator</h1>
          <p className="text-lg text-gray-600">Fair equity distribution analysis based on contributions and risk factors</p>
        </div>

        <Stepper />

        {step === "prepare" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Founder Information</h2>
                <button
                  onClick={addFounder}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Another Founder
                </button>
              </div>

              <div className="space-y-8">
                {founders.map((founder, index) => (
                  <div key={founder.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Founder {index + 1}</h3>
                      {founders.length > 1 && (
                        <button
                          onClick={() => removeFounder(founder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Founder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Founder Name</label>
                        <input
                          type="text"
                          value={founder.name}
                          onChange={(e) => updateFounder(founder.id, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter founder name"
                        />
                      </div>

                      {/* Primary Role */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
                        <select
                          value={founder.primary}
                          onChange={(e) => updateFounder(founder.id, "primary", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="CEO / Business Lead">CEO / Business Lead</option>
                          <option value="CTO / Technical Lead">CTO / Technical Lead</option>
                          <option value="CMO / Marketing Lead">CMO / Marketing Lead</option>
                          <option value="CFO / Finance Lead">CFO / Finance Lead</option>
                          <option value="CPO / Product Lead">CPO / Product Lead</option>
                          <option value="Advisor">Advisor</option>
                          <option value="Investor">Investor</option>
                        </select>
                      </div>

                      {/* Capital Contribution */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capital Contribution ($)</label>
                        <input
                          type="number"
                          value={founder.capitalContribution}
                          onChange={(e) => updateFounder(founder.id, "capitalContribution", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      {/* Experience Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                        <select
                          value={founder.experienceLevel}
                          onChange={(e) => updateFounder(founder.id, "experienceLevel", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="First-time Entrepreneur">First-time Entrepreneur</option>
                          <option value="Experienced (1-2 exits)">Experienced (1-2 exits)</option>
                          <option value="Serial Entrepreneur (3+ exits)">Serial Entrepreneur (3+ exits)</option>
                          <option value="Industry Expert">Industry Expert</option>
                        </select>
                      </div>

                      {/* Time Commitment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment: {founder.timeCommitment}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={founder.timeCommitment}
                          onChange={(e) => updateFounder(founder.id, "timeCommitment", parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>

                      {/* Salary Foregone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salary Foregone: {founder.salaryForegone}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={founder.salaryForegone}
                          onChange={(e) => updateFounder(founder.id, "salaryForegone", parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>

                      {/* Risk Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                        <select
                          value={founder.riskLevel}
                          onChange={(e) => updateFounder(founder.id, "riskLevel", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Low Risk (Stable income)">Low Risk (Stable income)</option>
                          <option value="Medium Risk (Some savings)">Medium Risk (Some savings)</option>
                          <option value="High Risk (All-in commitment)">High Risk (All-in commitment)</option>
                        </select>
                      </div>

                      {/* Network Value */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Network Value</label>
                        <select
                          value={founder.networkValue}
                          onChange={(e) => updateFounder(founder.id, "networkValue", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Limited Network">Limited Network</option>
                          <option value="Moderate Network">Moderate Network</option>
                          <option value="Strong Industry Network">Strong Industry Network</option>
                          <option value="Exceptional Connections">Exceptional Connections</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCalculate}
                  disabled={calculating || founders.some(f => !f.name.trim())}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {calculating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </>
                  ) : (
                    "Calculate AI Equity Distribution"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Equity Distribution Results</h2>
                <button onClick={() => go("prepare")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Input
                </button>
              </div>

              {equityResults ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equityResults.founders?.map((result, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">{result.equityPercentage}%</div>
                          <div className="text-lg font-semibold text-gray-900 mb-1">{result.name}</div>
                          <div className="text-sm text-gray-600 mb-4">{result.primary}</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capital:</span>
                              <span className="font-medium">${result.capitalContribution?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Experience:</span>
                              <span className="font-medium">{result.experienceLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium">{result.timeCommitment}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {equityResults.analysis && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis & Recommendations</h3>
                      <div className="prose max-w-none text-gray-700">
                        <p>{equityResults.analysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results available</h3>
                  <p className="text-gray-600">Please calculate equity distribution to see results.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
