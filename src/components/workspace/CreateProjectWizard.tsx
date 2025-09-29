"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, CheckCircle, Sparkles, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceData {
  id: string;
  name: string;
  purpose: string;
  description: string | null;
  ai_features: unknown;
  created_at: string;
  status: string;
}

interface WorkspaceMember {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface Profile {
  id?: string;
  name: string | null;
  email: string | null;
  first_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
}

interface CreateProjectWizardProps {
  workspaceId: string;
  workspaceName: string;
  workspaceData: WorkspaceData | null;
  workspaceMembers: WorkspaceMember[];
  profile: Profile;
}

interface SuggestedTask {
  title: string;
  description: string;
  estimatedDays: number;
}

export default function CreateProjectWizard({ 
  workspaceId, 
  workspaceName, 
  /* workspaceData intentionally unused for now */
  workspaceData: _workspaceData, 
  workspaceMembers, 
  profile 
}: CreateProjectWizardProps) {
  const router = useRouter();
  void _workspaceData;
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    deadline: "",
    collaborators: [] as string[],
    useAISuggestions: true,
    customTasks: [] as { title: string; description: string }[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detect project type from name
  // Detect project type helper (reserved for future use)

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Project name is required';
        }
        break;
      case 2:
        // No validation needed for goal/description
        break;
      case 3:
        // No validation needed for collaborators
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/workspaces/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          ...formData,
          suggestedTasks: formData.useAISuggestions ? suggestedTasks : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Project created successfully!');
        router.push(`/workspace-hub/${workspaceId}/projects/${data.projectId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomTask = () => {
    setFormData(prev => ({
      ...prev,
      customTasks: [...prev.customTasks, { title: '', description: '' }]
    }));
  };

  const updateCustomTask = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customTasks: prev.customTasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  const removeCustomTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customTasks: prev.customTasks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-8 h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push(`/workspace-hub/${workspaceId}/projects`)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Project
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set up your project in {workspaceName}
            </p>
          </div>
        </div>

        {/* Progress Steps (3 steps: Basics, Collaborators, Tasks) */}
        <div className="flex items-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= stepNumber
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {stepNumber === 1 && 'Basic Info'}
                {stepNumber === 2 && 'Collaborators'}
                {stepNumber === 3 && 'Tasks'}
              </span>
              {stepNumber < 3 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Wizard Steps */}
        <div className="lg:col-span-2">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Project Basics
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Pitch Deck Build, MVP Development"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal / One-liner (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    placeholder="e.g., Investor-ready pitch in 2 weeks"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this project is about..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removed Step 2 (Details) */}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Collaborators
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select team members to collaborate on this project
              </p>
              
              <div className="space-y-3">
                {workspaceMembers
                  .filter(m => m.profiles?.id !== profile?.id)
                  .map((member) => (
                  <label key={member.user_id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.collaborators.includes(member.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('collaborators', [...formData.collaborators, member.user_id]);
                        } else {
                          handleInputChange('collaborators', formData.collaborators.filter(id => id !== member.user_id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex items-center space-x-3">
                      {member.profiles?.avatar_url ? (
                        <Image
                          src={member.profiles.avatar_url}
                          alt={member.profiles.name || member.profiles.email || 'Avatar'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {(member.profiles.name || member.profiles.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.profiles.name || member.profiles.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.profiles.email} • {member.role}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Initial Tasks
              </h2>
              
              {isGeneratingTasks && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Generating AI task suggestions…</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">This usually takes a few seconds.</div>
                    </div>
                  </div>
                </div>
              )}

              {!isGeneratingTasks && suggestedTasks.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      AI Suggested Tasks
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {suggestedTasks.map((task, index) => {
                      const isEditing = editingIndex === index;
                      return (
                        <div key={index} className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => setSuggestedTasks(prev => prev.map((t, i) => i === index ? { ...t, title: e.target.value } : t))}
                                  className="w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Task title"
                                />
                              ) : (
                                <h4 className="font-medium text-gray-900 dark:text-white">{task.title || 'Untitled task'}</h4>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => setEditingIndex(null)}
                                    className="p-2 rounded-lg bg-green-600 text-white"
                                    aria-label="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingIndex(null)}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                                    aria-label="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setEditingIndex(index)}
                                  className="p-2 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                  aria-label="Edit task"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                value={(task as unknown as { assigneeId?: string }).assigneeId || ''}
                                onChange={(e) => setSuggestedTasks(prev => prev.map((t, i) => i === index ? { ...t, assigneeId: e.target.value } as SuggestedTask & { assigneeId?: string; dueDate?: string } : t))}
                                className="w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="">Unassigned</option>
                                {workspaceMembers.map((m) => (
                                  <option key={m.user_id} value={m.user_id}>{m.profiles?.name || m.profiles?.email || m.user_id}</option>
                                ))}
                              </select>
                              <input
                                type="date"
                                value={(task as unknown as { dueDate?: string }).dueDate || ''}
                                onChange={(e) => setSuggestedTasks(prev => prev.map((t, i) => i === index ? { ...t, dueDate: e.target.value } as SuggestedTask & { assigneeId?: string; dueDate?: string } : t))}
                                className="w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                              <textarea
                                value={task.description}
                                onChange={(e) => setSuggestedTasks(prev => prev.map((t, i) => i === index ? { ...t, description: e.target.value } : t))}
                                className="md:col-span-2 w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Task description"
                                rows={2}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                              <div>{task.description || 'No description'}</div>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                  Due: {(task as unknown as { dueDate?: string }).dueDate || '—'}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                  Assignee: {(task as unknown as { assigneeId?: string }).assigneeId ? (workspaceMembers.find(m => m.user_id === (task as unknown as { assigneeId?: string }).assigneeId)?.profiles?.name || 'User') : '—'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Custom Tasks
                  </h3>
                  <button
                    onClick={async () => {
                      setIsGeneratingTasks(true);
                      try {
                        const res = await fetch('/api/ai-tools/project-task-suggestions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            projectName: formData.name,
                            goal: formData.goal,
                            projectType: (formData.name || '').toLowerCase(),
                            workspaceId,
                            projectDescription: formData.description,
                            collaborators: formData.collaborators,
                            deadline: formData.deadline,
                          })
                        });
                        const data = await res.json();
                        type SuggestionIn = { title?: string; description?: string; dueDate?: string; assigneeId?: string };
                        const mapped = (data.suggestions || []).map((s: SuggestionIn) => ({
                          title: s.title || '',
                          description: s.description || '',
                          dueDate: s.dueDate || '',
                          assigneeId: s.assigneeId || '',
                        }));
                        setSuggestedTasks(mapped);
                      } finally {
                        setIsGeneratingTasks(false);
                      }
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Suggest</span>
                  </button>
                  <button
                    onClick={addCustomTask}
                    disabled={isGeneratingTasks}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.customTasks.map((task, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateCustomTask(index, 'title', e.target.value)}
                          placeholder="Task title"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => removeCustomTask(index)}
                          className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        value={task.description}
                        onChange={(e) => updateCustomTask(index, 'description', e.target.value)}
                        placeholder="Task description"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-3">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sticky Summary / Tips */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Project Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Name</dt>
                  <dd className="text-gray-900 dark:text-white font-medium max-w-[60%] text-right truncate">{formData.name || '—'}</dd>
                </div>
                <div className="flex items-start justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Goal</dt>
                  <dd className="text-gray-900 dark:text-white font-medium max-w-[60%] text-right truncate">{formData.goal || '—'}</dd>
                </div>
                <div className="flex items-start justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Deadline</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{formData.deadline || '—'}</dd>
                </div>
                <div className="flex items-start justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Collaborators</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{formData.collaborators.length}</dd>
                </div>
                <div className="flex items-start justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">AI Suggestions</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{formData.useAISuggestions ? 'On' : 'Off'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI Tips</h4>
                  <ul className="mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <li>Keep names short and clear</li>
                    <li>Use goal to guide AI task suggestions</li>
                    <li>Add 3–5 custom tasks to start quickly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
