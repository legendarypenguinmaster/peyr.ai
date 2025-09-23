"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Check, Search, Users, TrendingUp, DollarSign, MapPin, Calendar, Target, Zap, Star, ExternalLink, MessageCircle } from "lucide-react";

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

type InvestorMatch = {
  id: string;
  name: string;
  investor_type?: string;
  industries?: string[];
  stage_focus?: string[];
  min_check?: number;
  max_check?: number;
  match_score: number;
  explanation: string;
};

export default function InvestorMatchingPage() {
  const supabase = createClient();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [matches, setMatches] = useState<InvestorMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      } catch (e: any) {
        setError(e.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [supabase]);

  const findMatches = async () => {
    if (!selectedProject) return;
    setStep(3);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-tools/investor-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject.id }),
      });
      if (!res.ok) throw new Error("Failed to get matches");
      const data = await res.json();
      setMatches(data.matches || []);
      setStep(4);
    } catch (e: any) {
      setError(e.message || "Failed to get matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Investor Matching
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find investors most likely to fund your startup with our advanced AI matching algorithm
          </p>
        </div>

        {/* Enhanced Steps indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, title: "Select Project", icon: Target },
              { step: 2, title: "Review Details", icon: Check },
              { step: 3, title: "AI Matching", icon: Zap },
              { step: 4, title: "View Results", icon: Users }
            ].map(({ step: s, title, icon: Icon }, index) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    step === s
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-lg scale-110"
                      : s < step
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 border-transparent text-white shadow-md"
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
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                    s < step ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gray-300 dark:bg-gray-700"
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
                <p className="text-gray-600 dark:text-gray-400">Choose the project you want to find investors for</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-blue-600"></div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Loading your projects...</div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create a project first to find matching investors</p>
                  <button
                    onClick={() => window.location.href = '/project/new'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                              <DollarSign className="w-4 h-4 mr-1" />
                              Budget: ${p.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {selectedProject?.id === p.id && (
                          <div className="ml-4">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                <p className="text-gray-600 dark:text-gray-400">Confirm your project information before finding investors</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8">
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
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {selectedProject.commitment}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedProject.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Budget</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : "Not specified"}
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Role Needed</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProject.role_needed || "Not specified"}
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Status</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProject.status}
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Deadline</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProject.deadline || "Not specified"}
                    </div>
                  </div>
                </div>

                {selectedProject.required_skills?.length > 0 && (
                  <div>
                    <div className="flex items-center mb-3">
                      <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Required Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.required_skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-sm bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                  onClick={findMatches} 
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Search className="w-5 h-5 mr-2" /> 
                  Find Matching Investors
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-20">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 border-r-blue-600 dark:border-r-blue-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI is analyzing your project</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Our advanced AI is matching your startup with investors most likely to fund your vision
              </p>
              
              <div className="flex justify-center space-x-2 mb-8">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Processing steps:</div>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">Analyzing project requirements</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 dark:text-gray-300">Scanning investor database</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-gray-700 dark:text-gray-300">Calculating match scores</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                      <span className="text-gray-500 dark:text-gray-400">Generating recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Matching Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400">We found {matches.length} investors who match your project</p>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Matches Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We couldn't find investors that match your project criteria. Try adjusting your project details or check back later.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((m, index) => (
                    <div key={m.id} className="group bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {m.name}
                              </h3>
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                                #{index + 1} Match
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {m.investor_type || "Investor"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                            {m.match_score}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Match Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Industries</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {formatArray(m.industries)}
                          </div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Stage Focus</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {formatArray(m.stage_focus)}
                          </div>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Check Size</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {formatRange(m.min_check, m.max_check)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-4 mb-6">
                        <div className="flex items-center mb-2">
                          <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Why This Match?</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {m.explanation}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact
                          </button>
                          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm font-medium">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Profile
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Recommended</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setStep(2)} 
                  className="flex items-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button 
                  onClick={() => setStep(1)} 
                  className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, small }: { label: string; value?: string; small?: boolean }) {
  return (
    <div>
      <div className={`font-medium text-gray-900 dark:text-white ${small ? "text-xs" : "text-sm"}`}>{label}</div>
      <div className={`text-gray-700 dark:text-gray-300 ${small ? "text-xs" : "text-sm"}`}>{value || "—"}</div>
    </div>
  );
}

function formatArray(arr?: string[]) {
  if (!arr || arr.length === 0) return "—";
  return arr.join(", ");
}

function formatRange(min?: number, max?: number) {
  if (min == null && max == null) return "—";
  const fmt = (n?: number) => (n == null ? undefined : `$${n.toLocaleString()}`);
  const a = fmt(min);
  const b = fmt(max);
  if (a && b) return `${a} - ${b}`;
  return a || b || "—";
}


