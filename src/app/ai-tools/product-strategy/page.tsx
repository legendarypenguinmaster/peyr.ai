"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, Lightbulb, Download, Loader2, Save, Plus } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type StrategyInputs = {
  title: string;
  description: string;
  targetUsers: string;
  businessGoals: string;
  industry: string;
  stage: string;
  commitment: string;
  roleNeeded: string;
  requiredSkills: string[];
  budget: number | "";
  deadline: string;
  keywords: string[];
};

type StrategyResult = {
  mvpFeatures: string[];
  roadmap: Array<{
    phase: string;
    duration: string;
    features: string[];
    goals: string[];
  }>;
  priorities: string[];
  goToMarket: {
    channels: string[];
    pricing: string;
    positioning: string;
    launch: string;
  };
  recommendations: string[];
};

const defaultInputs: StrategyInputs = {
  title: "",
  description: "",
  targetUsers: "",
  businessGoals: "",
  industry: "ai/ml",
  stage: "idea",
  commitment: "full-time",
  roleNeeded: "",
  requiredSkills: [],
  budget: "",
  deadline: "",
  keywords: [],
};

export default function ProductStrategyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const step = (params.get("step") || "input") as
    | "input"
    | "generate"
    | "review"
    | "save"
    | "export";

  const [inputs, setInputs] = useState<StrategyInputs>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);

  const go = (s: string) => router.replace(`/ai-tools/product-strategy?step=${s}`);

  const restart = () => {
    setInputs(defaultInputs);
    setStrategy(null);
    go("input");
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !inputs.requiredSkills.includes(skill.trim())) {
      setInputs(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setInputs(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
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

  const generateStrategy = async () => {
    setLoading(true);
    setStrategy(null);
    try {
      const res = await fetch("/api/ai-tools/product-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      if (!res.ok) throw new Error("Failed to generate strategy");
      const data = await res.json();
      setStrategy(data.strategy);
      go("review");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to generate strategy");
    } finally {
      setLoading(false);
    }
  };


  const saveAsProject = async () => {
    try {
      console.log("Inputs:", inputs);
      
      // Ensure all required fields are present and properly formatted
      const projectData = {
        title: inputs.title.trim(),
        description: inputs.description.trim(),
        fullDescription: `Target Users: ${inputs.targetUsers}\n\nBusiness Goals: ${inputs.businessGoals}\n\nGenerated Strategy: ${JSON.stringify(strategy, null, 2)}`,
        industry: inputs.industry,
        stage: inputs.stage,
        commitment: inputs.commitment,
        roleNeeded: inputs.roleNeeded.trim() || "Co-founder",
        requiredSkills: inputs.requiredSkills.length > 0 ? inputs.requiredSkills : ["Product Management"],
        status: "planning",
        budget: inputs.budget || null,
        deadline: inputs.deadline || null,
        keywords: inputs.keywords.length > 0 ? inputs.keywords : [],
      };

      console.log("Project data:", projectData);

      // Validate required fields
      if (!projectData.title || !projectData.description) {
        alert(`Title and description are required. Title: "${projectData.title}", Description: "${projectData.description}"`);
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        alert("Project saved successfully!");
        go("export");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save project");
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save project");
    }
  };


  const exportPDF = async () => {
    try {
      if (!strategy) return;
      
      const cleanHTML = `
        <div style="font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px;">
          <h1 style="font-size: 24px; margin: 0 0 20px 0; color: #000;">AI Product Strategy</h1>
          <h2 style="font-size: 20px; margin: 0 0 15px 0; color: #333;">${inputs.title}</h2>
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">${inputs.description}</p>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">MVP Features</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            ${strategy.mvpFeatures.map(feature => `<li style="margin-bottom: 5px; font-size: 14px;">${feature}</li>`).join('')}
          </ul>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Product Roadmap</h3>
          ${strategy.roadmap.map(phase => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${phase.phase} (${phase.duration})</h4>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;"><strong>Goals:</strong> ${phase.goals.join(', ')}</p>
              <ul style="margin: 0; padding-left: 20px;">
                ${phase.features.map(feature => `<li style="margin-bottom: 3px; font-size: 14px;">${feature}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Go-to-Market Strategy</h3>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Channels:</strong> ${strategy.goToMarket.channels.join(', ')}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Pricing:</strong> ${strategy.goToMarket.pricing}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Positioning:</strong> ${strategy.goToMarket.positioning}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Launch:</strong> ${strategy.goToMarket.launch}</p>
          </div>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Key Priorities</h3>
          <ul style="margin: 0 0 20px 0; padding-left: 20px;">
            ${strategy.priorities.map(priority => `<li style="margin-bottom: 5px; font-size: 14px;">${priority}</li>`).join('')}
          </ul>
          
          <h3 style="font-size: 18px; margin: 20px 0 10px 0; color: #000;">Recommendations</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${strategy.recommendations.map(rec => `<li style="margin-bottom: 5px; font-size: 14px;">${rec}</li>`).join('')}
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
      
      pdf.save("product-strategy.pdf");
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
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Product Strategy</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate MVP features, roadmap, and go-to-market strategy for your startup idea.</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
          {step === "input" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Step 1 — Idea Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Product Title *</label>
                  <input 
                    type="text" 
                    value={inputs.title} 
                    onChange={(e) => setInputs({ ...inputs, title: e.target.value })} 
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Enter your product title"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Description *</label>
                  <textarea 
                    value={inputs.description} 
                    onChange={(e) => setInputs({ ...inputs, description: e.target.value })} 
                    rows={4}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Describe your product idea"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Target Users *</label>
                  <textarea 
                    value={inputs.targetUsers} 
                    onChange={(e) => setInputs({ ...inputs, targetUsers: e.target.value })} 
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="Who are your target users?"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Business Goals *</label>
                  <textarea 
                    value={inputs.businessGoals} 
                    onChange={(e) => setInputs({ ...inputs, businessGoals: e.target.value })} 
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    placeholder="What are your business goals?"
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
                    <label className="text-sm text-gray-700 dark:text-gray-300">Stage</label>
                    <select value={inputs.stage} onChange={(e) => setInputs({ ...inputs, stage: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <option value="idea">Idea</option>
                      <option value="mvp">MVP</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Commitment</label>
                    <select value={inputs.commitment} onChange={(e) => setInputs({ ...inputs, commitment: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <option value="part-time">Part-time</option>
                      <option value="full-time">Full-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Role Needed</label>
                    <input 
                      type="text" 
                      value={inputs.roleNeeded} 
                      onChange={(e) => setInputs({ ...inputs, roleNeeded: e.target.value })} 
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                      placeholder="e.g., Technical Co-founder"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Required Skills</label>
                  <div className="mt-1 flex flex-wrap gap-2 mb-2">
                    {inputs.requiredSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add skill" 
                      className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add skill"]') as HTMLInputElement;
                        if (input) {
                          addSkill(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Budget ($)</label>
                    <input 
                      type="number" 
                      value={inputs.budget} 
                      onChange={(e) => setInputs({ ...inputs, budget: Number(e.target.value) })} 
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Deadline</label>
                    <input 
                      type="date" 
                      value={inputs.deadline} 
                      onChange={(e) => setInputs({ ...inputs, deadline: e.target.value })} 
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300">Keywords</label>
                  <div className="mt-1 flex flex-wrap gap-2 mb-2">
                    {inputs.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {keyword}
                        <button onClick={() => removeKeyword(keyword)} className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">×</button>
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
                      className="px-4 py-2 rounded-lg bg-green-600 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button onClick={() => router.back()} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button 
                  onClick={() => go("generate")} 
                  disabled={!inputs.title || !inputs.description || !inputs.targetUsers || !inputs.businessGoals}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Strategy
                </button>
              </div>
            </div>
          )}

          {step === "generate" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Generating your product strategy...</p>
              <div className="mt-6 flex items-center justify-center">
                <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
              </div>
              {(() => {
                if (!loading) generateStrategy();
                return null;
              })()}
            </div>
          )}

          {step === "review" && strategy && (
            <div id="strategy-review">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 3 — Review Strategy</h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">MVP Features</h3>
                  <ul className="space-y-2">
                    {strategy.mvpFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-blue-800 dark:text-blue-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Product Roadmap</h3>
                  <div className="space-y-4">
                    {strategy.roadmap.map((phase, index) => (
                      <div key={index} className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">{phase.phase} ({phase.duration})</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3"><strong>Goals:</strong> {phase.goals.join(', ')}</p>
                        <ul className="space-y-1">
                          {phase.features.map((feature, fIndex) => (
                            <li key={fIndex} className="flex items-start text-sm">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <span className="text-green-800 dark:text-green-200">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">Go-to-Market Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-1"><strong>Channels:</strong></p>
                      <p className="text-purple-800 dark:text-purple-200">{strategy.goToMarket.channels.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-1"><strong>Pricing:</strong></p>
                      <p className="text-purple-800 dark:text-purple-200">{strategy.goToMarket.pricing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-1"><strong>Positioning:</strong></p>
                      <p className="text-purple-800 dark:text-purple-200">{strategy.goToMarket.positioning}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-1"><strong>Launch:</strong></p>
                      <p className="text-purple-800 dark:text-purple-200">{strategy.goToMarket.launch}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">Key Priorities</h3>
                  <ul className="space-y-2">
                    {strategy.priorities.map((priority, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-orange-800 dark:text-orange-200">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {strategy.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-800 dark:text-gray-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <div className="flex gap-3">
                  <button onClick={() => go("input")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                  <button onClick={restart} className="px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 cursor-pointer">Restart</button>
                </div>
                <button onClick={() => go("save")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Continue</button>
              </div>
            </div>
          )}

          {step === "save" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 4 — Save Strategy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Save your product strategy as a new project:</p>
              
              <div className="max-w-md mx-auto">
                <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                  <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Save as New Project</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create a new project with this strategy</p>
                  <button onClick={saveAsProject} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Save as Project</button>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => go("review")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
                <button onClick={() => go("export")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold cursor-pointer">Skip to Export</button>
              </div>
            </div>
          )}

          {step === "export" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Step 5 — Export Strategy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Download your product strategy as a PDF document.</p>
              <div className="flex justify-between">
                <button onClick={() => go("save")} className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer">Back</button>
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
