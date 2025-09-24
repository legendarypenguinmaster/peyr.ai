"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Check, TrendingUp, Users, Target, Zap, BarChart3, AlertTriangle, Download } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  commitment: string;
  role_needed?: string;
  required_skills: string[];
  status: string;
  budget?: number;
  deadline?: string;
  keywords: string[];
};

type MarketValidation = {
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    tamValue: number;
    samValue: number;
    somValue: number;
  };
  competitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    differentiation: string;
  }>;
  customerSegments: Array<{
    segment: string;
    painPoints: string[];
    solution: string;
  }>;
  trends: string[];
  risks: string[];
  validationScore: number;
  explanation: string;
};

export default function MarketValidationPage() {
  const supabase = createClient();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [validation, setValidation] = useState<MarketValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectKeywords, setProjectKeywords] = useState<string[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("projects")
          .select("id,title,description,industry,stage,commitment,role_needed,required_skills,status,budget,deadline,keywords")
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

  const runValidation = async () => {
    if (!selectedProject) return;
    setStep(3);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-tools/market-validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId: selectedProject.id,
          description: projectDescription,
          keywords: projectKeywords
        }),
      });
      if (!res.ok) throw new Error("Failed to run market validation");
      const data = await res.json();
      setValidation(data.validation);
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run market validation");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!validation || !selectedProject) return;
    
    const element = document.getElementById('validation-report');
    if (!element) return;

    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Market Validation Report - ${selectedProject.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .score { font-size: 24px; font-weight: bold; color: #059669; }
              .competitor { margin-bottom: 15px; padding: 10px; border-left: 3px solid #3b82f6; }
              .segment { margin-bottom: 15px; padding: 10px; background: #f3f4f6; }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => history.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Market Validation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get comprehensive market insights and validation scores for your startup idea
          </p>
        </div>

        {/* Enhanced Steps indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, title: "Select Project", icon: Target },
              { step: 2, title: "Review Details", icon: Check },
              { step: 3, title: "AI Analysis", icon: Zap },
              { step: 4, title: "View Report", icon: BarChart3 },
              { step: 5, title: "Export", icon: Download }
            ].map(({ step: s, title, icon: Icon }, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    step === s
                      ? "bg-gradient-to-r from-green-500 to-blue-600 border-transparent text-white shadow-lg scale-110"
                      : s < step
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-md"
                      : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800"
                  }`}>
                    {s < step ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium mt-2 transition-colors ${
                    step >= s ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {title}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                    s < step ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gray-300 dark:bg-gray-700"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Step content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your Project</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose the project you want to validate in the market</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-green-600"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Loading your projects...</div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create a project first to run market validation</p>
                  <button
                    onClick={() => window.location.href = '/project/new'}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`group text-left border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
                        selectedProject?.id === p.id
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {p.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {p.industry}
                            </span>
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {p.stage}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
                            {p.description}
                          </p>
                          {p.budget && (
                            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Budget: ${p.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {selectedProject?.id === p.id && (
                          <div className="ml-4">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  disabled={!selectedProject}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && selectedProject && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Project Details</h2>
                <p className="text-gray-600 dark:text-gray-400">Confirm and refine your project information for market validation</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedProject.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {selectedProject.industry}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {selectedProject.stage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Project Description
                    </label>
                    <textarea
                      value={projectDescription || selectedProject.description}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={4}
                      placeholder="Describe your project in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={projectKeywords.join(", ") || selectedProject.keywords.join(", ")}
                      onChange={(e) => setProjectKeywords(e.target.value.split(",").map(k => k.trim()).filter(k => k))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="AI, SaaS, automation, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(1)} 
                  className="flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button 
                  onClick={runValidation} 
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <BarChart3 className="w-5 h-5 mr-2" /> 
                  Run Market Validation
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-600 opacity-20 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-green-600 dark:border-t-green-400 border-r-blue-600 dark:border-r-blue-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI is analyzing your market</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Our advanced AI is evaluating market size, competitors, trends, and validation potential
              </p>
              
              <div className="flex justify-center space-x-2 mb-8">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Analysis steps:</div>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">Calculating market size</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">Analyzing competitors</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">Identifying customer segments</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-gray-700 dark:text-gray-300">Evaluating trends & risks</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-500 dark:text-gray-400">Generating validation score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && validation && selectedProject && (
            <div id="validation-report">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Market Validation Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis of {selectedProject.title}</p>
              </div>

              {/* Validation Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-8">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-4">
                    {validation.validationScore}%
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Validation Score</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                    {validation.explanation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Market Size */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Market Size</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">TAM</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">{validation.marketSize.tam}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">SAM</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{validation.marketSize.sam}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">SOM</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{validation.marketSize.som}</span>
                    </div>
                  </div>
                </div>

                {/* Competitors */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Competitors</h3>
                  </div>
                  <div className="space-y-4">
                    {validation.competitors.map((competitor, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{competitor.name}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Strengths:</strong> {competitor.strengths.join(", ")}</p>
                          <p><strong>Weaknesses:</strong> {competitor.weaknesses.join(", ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Segments */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Segments</h3>
                  </div>
                  <div className="space-y-4">
                    {validation.customerSegments.map((segment, index) => (
                      <div key={index} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{segment.segment}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Pain Points:</strong> {segment.painPoints.join(", ")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Solution:</strong> {segment.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trends & Risks */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trends & Risks</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                        Market Trends
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {validation.trends.map((trend, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Key Risks
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {validation.risks.map((risk, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setStep(2)} 
                  className="flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button 
                  onClick={() => setStep(5)} 
                  className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          )}

          {step === 5 && validation && selectedProject && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Export Your Report</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Download your market validation report as a PDF for pitch decks and investor presentations
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={exportToPDF}
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <Target className="w-5 h-5 mr-2" />
                  New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
