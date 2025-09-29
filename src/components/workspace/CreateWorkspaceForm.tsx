"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Users, 
  Shield, 
  FileText, 
  Target, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Plus,
  X
} from "lucide-react";

interface CreateWorkspaceFormProps {
  profile: {
    name: string | null;
    email: string | null;
    first_name?: string | null;
    role?: string | null;
    avatar_url?: string | null;
  };
}

interface CoFounderInvite {
  email: string;
  name?: string;
  message?: string;
}

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

const aiFeatures: AIFeature[] = [
  {
    id: "roadmap",
    name: "AI Roadmap Generator",
    description: "Generate strategic roadmaps and milestones",
    icon: Target,
    enabled: true
  },
  {
    id: "task-manager",
    name: "AI Task Manager",
    description: "Intelligent task breakdown and prioritization",
    icon: CheckCircle,
    enabled: true
  },
  {
    id: "document-assistant",
    name: "AI Document Assistant",
    description: "Help with drafting and editing documents",
    icon: FileText,
    enabled: true
  },
  {
    id: "investor-readiness",
    name: "AI Investor Readiness Scan",
    description: "Analyze and improve investor presentation readiness",
    icon: DollarSign,
    enabled: false
  },
  {
    id: "trust-ledger",
    name: "Trust Ledger",
    description: "Track collaboration and build trust scores",
    icon: Shield,
    enabled: true
  }
];

export default function CreateWorkspaceForm({ profile }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [workspaceData, setWorkspaceData] = useState({
    name: "",
    purpose: "personal" as "personal" | "shared",
    description: "",
    aiFeatures: aiFeatures,
    trustAgreement: "",
    equitySplit: "",
    generateContract: false
  });
  
  const [coFounderInvites, setCoFounderInvites] = useState<CoFounderInvite[]>([]);
  const [newInvite, setNewInvite] = useState<CoFounderInvite>({
    email: "",
    name: "",
    message: ""
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAIFeatureToggle = (featureId: string) => {
    setWorkspaceData(prev => ({
      ...prev,
      aiFeatures: prev.aiFeatures.map(feature =>
        feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature
      )
    }));
  };

  const addCoFounderInvite = () => {
    if (newInvite.email) {
      setCoFounderInvites(prev => [...prev, newInvite]);
      setNewInvite({ email: "", name: "", message: "" });
    }
  };

  const removeCoFounderInvite = (index: number) => {
    setCoFounderInvites(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workspaceData,
          coFounderInvites,
          creatorId: profile.name || profile.first_name
        }),
      });

      if (response.ok) {
        const { workspace } = await response.json();
        router.push(`/workspace-hub/${workspace.id}`);
      } else {
        throw new Error('Failed to create workspace');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workspace Setup
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={workspaceData.name}
                    onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., AI Fitness Marketplace"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={workspaceData.description}
                    onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short pitch of what this workspace is for..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Workspace Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                    workspaceData.purpose === "personal"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setWorkspaceData(prev => ({ ...prev, purpose: "personal" }))}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Sandbox
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Private space for experimentation, brainstorming, and drafting with AI. Only you have access.
                  </p>
                </div>
                
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                    workspaceData.purpose === "shared"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setWorkspaceData(prev => ({ ...prev, purpose: "shared" }))}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Shared Workspace
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Collaboration space with co-founders. Enables Trust Ledger tracking and shared AI features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invite Co-Founders
              </h3>
              {workspaceData.purpose === "shared" ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Invite co-founders by email. They&apos;ll receive an invitation to join your workspace.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="email"
                        value={newInvite.email}
                        onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="co-founder@email.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={addCoFounderInvite}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {coFounderInvites.length > 0 && (
                      <div className="space-y-2">
                        {coFounderInvites.map((invite, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-900 dark:text-white">{invite.email}</span>
                            <button
                              onClick={() => removeCoFounderInvite(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Personal workspaces don&apos;t require co-founder invitations.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select AI Features
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Choose which AI features you want to enable in this workspace.
              </p>
              
              <div className="space-y-3">
                {workspaceData.aiFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        feature.enabled
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => handleAIFeatureToggle(feature.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          feature.enabled ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            feature.enabled ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{feature.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          feature.enabled ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                        }`}>
                          {feature.enabled && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trust & Equity Settings
              </h3>
              {workspaceData.purpose === "shared" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Trust Agreement (Optional)
                    </label>
                    <textarea
                      value={workspaceData.trustAgreement}
                      onChange={(e) => setWorkspaceData(prev => ({ ...prev, trustAgreement: e.target.value }))}
                      placeholder="e.g., 'We agree to split 50/50 equity if successful'"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="generateContract"
                      checked={workspaceData.generateContract}
                      onChange={(e) => setWorkspaceData(prev => ({ ...prev, generateContract: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="generateContract" className="text-sm text-gray-700 dark:text-gray-300">
                      Generate a lightweight founder contract draft
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Trust & equity settings are only available for shared workspaces.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmation & Launch
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Workspace Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Name:</strong> {workspaceData.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Type:</strong> {workspaceData.purpose === "personal" ? "Personal Sandbox" : "Shared Workspace"}
                  </p>
                  {workspaceData.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Description:</strong> {workspaceData.description}
                    </p>
                  )}
                </div>
                
                {workspaceData.purpose === "shared" && coFounderInvites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Co-Founders</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                      {coFounderInvites.map((invite, index) => (
                        <li key={index}>• {invite.email}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Features</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400">
                    {workspaceData.aiFeatures.filter(f => f.enabled).map((feature) => (
                      <li key={feature.id}>• {feature.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        
        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !workspaceData.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>Create Workspace</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
