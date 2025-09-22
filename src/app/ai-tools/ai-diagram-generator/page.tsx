"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import MermaidRenderer from "@/components/ui/MermaidRenderer";
import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, FileText, GitBranch, Workflow, Brain, Users, Download, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type DiagramType = "flowchart" | "process-flow" | "workflow" | "mind-map" | "org-chart";
type Step = "prepare" | "generate" | "result";

interface DiagramData {
  type: DiagramType;
  description: string;
}

interface GeneratedDiagram {
  mermaidCode: string;
  title: string;
  description: string;
}

const diagramTypes = [
  {
    id: "flowchart" as DiagramType,
    name: "Flowchart",
    description: "Visual representation of a process or algorithm with decision points and flow paths",
    icon: GitBranch,
    color: "blue"
  },
  {
    id: "process-flow" as DiagramType,
    name: "Process Flow",
    description: "Step-by-step breakdown of business processes and procedures",
    icon: ArrowRight,
    color: "green"
  },
  {
    id: "workflow" as DiagramType,
    name: "Workflow",
    description: "Sequence of tasks and activities in a business or project workflow",
    icon: Workflow,
    color: "purple"
  },
  {
    id: "mind-map" as DiagramType,
    name: "Mind Map",
    description: "Visual organization of ideas, concepts, and relationships in a radial structure",
    icon: Brain,
    color: "orange"
  },
  {
    id: "org-chart" as DiagramType,
    name: "Org Chart",
    description: "Hierarchical structure showing relationships and reporting lines in an organization",
    icon: Users,
    color: "indigo"
  }
];

export default function AiDiagramGeneratorPage() {
  const [currentStep, setCurrentStep] = useState<Step>("prepare");
  const [diagramData, setDiagramData] = useState<DiagramData>({
    type: "flowchart",
    description: ""
  });
  const [errors, setErrors] = useState<{ description?: string }>({});
  const [generatedDiagram, setGeneratedDiagram] = useState<GeneratedDiagram | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as Step;
      if (hash && ["prepare", "generate", "result"].includes(hash)) {
        setCurrentStep(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle zoom shortcuts when we're on the result step and have a diagram
      if (currentStep !== "result" || !generatedDiagram) return;
      
      // Check for Ctrl/Cmd + Plus/Minus/0
      if ((event.ctrlKey || event.metaKey)) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
          case '0':
            event.preventDefault();
            handleResetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, generatedDiagram, zoomLevel]);

  const validateForm = () => {
    const newErrors: { description?: string } = {};
    
    if (!diagramData.description.trim()) {
      newErrors.description = "Process description is required";
    } else if (diagramData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDiagram = async () => {
    if (validateForm()) {
      setCurrentStep("generate");
      window.location.hash = "generate";
      setIsGenerating(true);
      setGenerationError(null);
      setGeneratedDiagram(null);

      try {
        const response = await fetch("/api/ai-tools/diagram-generator/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: diagramData.type,
            description: diagramData.description,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate diagram");
        }

        setGeneratedDiagram(result.data);
        setCurrentStep("result");
        window.location.hash = "result";
      } catch (error) {
        console.error("Generation error:", error);
        setGenerationError(error instanceof Error ? error.message : "Failed to generate diagram");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const updateDiagramData = (field: keyof DiagramData, value: string | DiagramType) => {
    setDiagramData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === "description" && errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700",
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Diagram Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create professional diagrams instantly with AI. Describe your process and get a visual representation in seconds.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[
              { id: "prepare", label: "Prepare", step: 1 },
              { id: "generate", label: "Generate", step: 2 },
              { id: "result", label: "Result", step: 3 }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step.id 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : ["prepare", "generate", "result"].indexOf(currentStep) > index
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                }`}>
                  {["prepare", "generate", "result"].indexOf(currentStep) > index ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.step}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step.id 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    ["prepare", "generate", "result"].indexOf(currentStep) > index
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Prepare */}
        {currentStep === "prepare" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Select Diagram Type & Describe Your Process
              </h2>

              {/* Diagram Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Choose Diagram Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diagramTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = diagramData.type === type.id;
                    const colorClasses = getColorClasses(type.color);
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => updateDiagramData("type", type.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          isSelected 
                            ? `border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20` 
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${colorClasses}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {type.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {type.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Process Description */}
              <div className="mb-8">
                <label htmlFor="description" className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Process Description
                </label>
                <textarea
                  id="description"
                  value={diagramData.description}
                  onChange={(e) => updateDiagramData("description", e.target.value)}
                  placeholder="Describe the process, workflow, or system you want to visualize. Be as detailed as possible for better results..."
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.description
                      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {diagramData.description.length}/500 characters
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateDiagram}
                  disabled={!diagramData.description.trim()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Generate AI Diagram</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Generate */}
        {currentStep === "generate" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Generating Your Diagram
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Our AI is analyzing your description and creating a professional {diagramTypes.find(t => t.id === diagramData.type)?.name.toLowerCase()}...
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Selected Type:</strong> {diagramTypes.find(t => t.id === diagramData.type)?.name}
                    </p>
                    <p className="text-blue-800 dark:text-blue-300 text-sm mt-1">
                      <strong>Description:</strong> {diagramData.description.substring(0, 100)}...
                    </p>
                  </div>
                </>
              ) : generationError ? (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Generation Failed
                  </h2>
                  <p className="text-red-600 dark:text-red-400 mb-6">
                    {generationError}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentStep("prepare");
                      window.location.hash = "prepare";
                      setGenerationError(null);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {currentStep === "result" && generatedDiagram && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {generatedDiagram.title} Generated Successfully!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your AI-generated diagram is ready for use.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Download as SVG
                      const svgElement = document.querySelector('.mermaid-container svg');
                      if (svgElement) {
                        const svgData = new XMLSerializer().serializeToString(svgElement);
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const svgUrl = URL.createObjectURL(svgBlob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = svgUrl;
                        downloadLink.download = `${diagramData.type}-diagram.svg`;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(svgUrl);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep("prepare");
                      window.location.hash = "prepare";
                      setDiagramData({ type: "flowchart", description: "" });
                      setGeneratedDiagram(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Create New</span>
                  </button>
                </div>
              </div>

              {/* Diagram Visualization */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                {/* Zoom Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Diagram Preview</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use zoom controls or keyboard shortcuts (Ctrl/Cmd + +/-/0)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 300}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="relative min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-auto scroll-smooth">
                  <div 
                    className="min-h-[400px] flex items-center justify-center transition-transform duration-200 ease-in-out"
                    style={{ 
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'center center',
                      minWidth: zoomLevel > 100 ? '100%' : 'auto'
                    }}
                  >
                    <MermaidRenderer 
                      chart={generatedDiagram.mermaidCode} 
                      id={`diagram-${Date.now()}`}
                      className="min-h-[400px] flex items-center justify-center"
                    />
                  </div>
                </div>
              </div>

              {/* Diagram Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Diagram Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Type:</span>
                    <span className="text-blue-700 dark:text-blue-400 ml-2">
                      {diagramTypes.find(t => t.id === diagramData.type)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Generated:</span>
                    <span className="text-blue-700 dark:text-blue-400 ml-2">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800 dark:text-blue-300 font-medium">Format:</span>
                    <span className="text-blue-700 dark:text-blue-400 ml-2">
                      Mermaid.js
                    </span>
                  </div>
                </div>
              </div>

              {/* Mermaid Code Preview */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Mermaid Code</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    <code>{generatedDiagram.mermaidCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
