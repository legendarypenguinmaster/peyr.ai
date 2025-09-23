"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { ArrowLeft, ArrowRight, Wand2, Check, X, Bold, Italic, List, Type, AlignLeft, Underline, Quote } from "lucide-react";
import "@/styles/rich-text-editor.css";

interface ProjectData {
  title: string;
  industry: string;
  description: string;
  fullDescription: string;
  stage: string;
  commitment: string;
  status: string;
  roleNeeded: string;
  requiredSkills: string[];
  budget?: number;
  deadline?: string;
  keywords: string[];
}

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'basic';

  const [projectData, setProjectData] = useState<ProjectData>({
    title: "",
    industry: "",
    description: "",
    fullDescription: "",
    stage: "",
    commitment: "",
    status: "planning",
    roleNeeded: "",
    requiredSkills: [],
    budget: undefined,
    deadline: undefined,
    keywords: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const industries = [
    "fintech", "healthtech", "edtech", "e-commerce", "ai/ml", 
    "biotech", "cleantech", "other"
  ];

  const stages = ["idea", "mvp", "growth"];
  const commitments = ["part-time", "full-time", "contract"];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!projectData.title.trim()) {
      newErrors.title = "Project title is required";
    }
    if (!projectData.industry) {
      newErrors.industry = "Industry is required";
    }
    if (!projectData.description.trim()) {
      newErrors.description = "Short description is required";
    }
    if (!projectData.fullDescription.trim()) {
      newErrors.fullDescription = "Full description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!projectData.stage) {
      newErrors.stage = "Stage is required";
    }
    if (!projectData.commitment) {
      newErrors.commitment = "Commitment is required";
    }
    if (!projectData.roleNeeded.trim()) {
      newErrors.roleNeeded = "Role needed is required";
    }
    if (projectData.requiredSkills.length === 0) {
      newErrors.requiredSkills = "At least one skill is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateFullDescription = async () => {
    if (!projectData.title || !projectData.industry || !projectData.description) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: projectData.title,
          industry: projectData.industry,
          description: projectData.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use the HTML content directly from AI
        setProjectData(prev => ({ ...prev, fullDescription: data.description }));
        // Update the editor content
        if (editorRef.current) {
          editorRef.current.innerHTML = data.description;
        }
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (step === 'basic' && validateStep1()) {
      router.push('/project/new?step=details');
    } else if (step === 'details' && validateStep2()) {
      router.push('/project/new?step=preview');
    }
  };

  const handlePost = async () => {
    setIsPosting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/project/invite/${data.project.id}`);
      }
    } catch (error) {
      console.error('Error posting project:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !projectData.requiredSkills.includes(skill.trim())) {
      setProjectData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setProjectData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !projectData.keywords.includes(keyword.trim())) {
      setProjectData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setProjectData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const canShowMagicButton = projectData.title && projectData.industry && projectData.description;

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setProjectData(prev => ({ ...prev, fullDescription: editorRef.current?.innerHTML || '' }));
    }
  };

  const insertText = (text: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      handleEditorInput();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Post New Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new project and find the perfect co-founders
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'basic', label: 'Basic Info', step: 1 },
              { id: 'details', label: 'Details', step: 2 },
              { id: 'preview', label: 'Preview', step: 3 }
            ].map((item, index) => (
              <div key={item.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === item.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : ['basic', 'details', 'preview'].indexOf(step) > index
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {['basic', 'details', 'preview'].indexOf(step) > index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{item.step}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === item.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    ['basic', 'details', 'preview'].indexOf(step) > index
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          {step === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Basic Project Information
              </h2>

              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry *
                </label>
                <select
                  value={projectData.industry}
                  onChange={(e) => setProjectData(prev => ({ ...prev, industry: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.industry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.industry && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your project (2-3 sentences)"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
              </div>

              {/* Full Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Description *
                  </label>
                  {canShowMagicButton && (
                    <button
                      onClick={generateFullDescription}
                      disabled={isGenerating}
                      className="flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                  )}
                </div>
                
                {/* Rich Text Editor Toolbar */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700 p-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h2')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Header"
                  >
                    <Type className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'blockquote')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button
                    type="button"
                    onClick={() => insertText('• ')}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Bullet Point
                  </button>
                </div>
                
                {/* Rich Text Editor Content */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  dangerouslySetInnerHTML={{ __html: projectData.fullDescription }}
                  className={`rich-text-editor w-full px-4 py-3 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[150px] max-h-[300px] overflow-y-auto ${
                    errors.fullDescription ? 'border-red-500' : ''
                  }`}
                  data-placeholder="Detailed description of your project, goals, and what you're looking for..."
                />
                
                {errors.fullDescription && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullDescription}</p>}
                
                {/* Formatting Help */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p>Use the toolbar above to format your text. You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, add headers, create lists, and insert quotes.</p>
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Project Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Development Stage *
                  </label>
                  <select
                    value={projectData.stage}
                    onChange={(e) => setProjectData(prev => ({ ...prev, stage: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.stage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select stage</option>
                    {stages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.stage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stage}</p>}
                </div>

                {/* Commitment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Commitment *
                  </label>
                  <select
                    value={projectData.commitment}
                    onChange={(e) => setProjectData(prev => ({ ...prev, commitment: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.commitment ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select commitment</option>
                    {commitments.map(commitment => (
                      <option key={commitment} value={commitment}>
                        {commitment.charAt(0).toUpperCase() + commitment.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.commitment && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.commitment}</p>}
                </div>
              </div>

              {/* Role Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Needed *
                </label>
                <input
                  type="text"
                  value={projectData.roleNeeded}
                  onChange={(e) => setProjectData(prev => ({ ...prev, roleNeeded: e.target.value }))}
                  placeholder="e.g., CTO, Designer, Marketing Lead"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.roleNeeded ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.roleNeeded && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleNeeded}</p>}
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Required Skills *
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {projectData.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                {errors.requiredSkills && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.requiredSkills}</p>}
              </div>

              {/* Budget and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget (Optional)
                  </label>
                  <input
                    type="number"
                    value={projectData.budget || ''}
                    onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Enter budget amount"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={projectData.deadline || ''}
                    onChange={(e) => setProjectData(prev => ({ ...prev, deadline: e.target.value || undefined }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (Optional)
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {projectData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm"
                      >
                        #{keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a keyword and press Enter"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Preview Your Project
              </h2>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {projectData.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                    {projectData.industry}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                    {projectData.stage}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm font-medium">
                    {projectData.commitment}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {projectData.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Full Description</h4>
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: projectData.fullDescription }}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Role Needed</h4>
                    <p className="text-gray-700 dark:text-gray-300">{projectData.roleNeeded}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {projectData.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {projectData.budget && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Budget</h4>
                      <p className="text-gray-700 dark:text-gray-300">${projectData.budget.toLocaleString()}</p>
                    </div>
                  )}

                  {projectData.deadline && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Deadline</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {new Date(projectData.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {projectData.keywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {projectData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => {
                if (step === 'details') {
                  router.push('/project/new?step=basic');
                } else if (step === 'preview') {
                  router.push('/project/new?step=details');
                }
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>

            {step === 'preview' ? (
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isPosting ? 'Posting...' : 'Post Project'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
