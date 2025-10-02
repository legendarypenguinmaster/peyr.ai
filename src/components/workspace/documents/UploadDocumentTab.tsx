"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface UploadDocumentTabProps {
  workspaceId: string;
  projects: Project[];
  onSuccess: () => void;
}

export default function UploadDocumentTab({ workspaceId, projects, onSuccess }: UploadDocumentTabProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'document',
    project_id: '',
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      if (form.project_id) formData.append('project_id', form.project_id);
      if (form.file) formData.append('file', form.file);

      const response = await fetch(`/api/workspaces/${workspaceId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create document');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating document');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, file }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm(prev => ({ ...prev, file }));
    }
  };

  const generateUploadAIDescription = async () => {
    if (!form.file) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', form.file);
      
      const response = await fetch('/api/ai-tools/documents/summarize', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({ ...prev, description: data.summary }));
      }
    } catch (err) {
      console.error('Failed to generate AI description:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload File
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.txt,.md"
          />
          {form.file ? (
            <div className="space-y-2">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {form.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(form.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, file: null }))}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Drop your file here, or{' '}
                  <span className="text-blue-600 dark:text-blue-400">browse</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supports PDF, DOC, DOCX, TXT, MD files
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Document title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <div className="flex gap-2">
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Document description"
          />
          {form.file && (
            <button
              type="button"
              onClick={generateUploadAIDescription}
              disabled={loading}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              title="Generate AI summary"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="document">Document</option>
          <option value="contract">Contract</option>
          <option value="legal">Legal</option>
          <option value="proposal">Proposal</option>
          <option value="note">Note</option>
        </select>
      </div>

      {form.type === 'document' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project (Optional)
          </label>
          <select
            value={form.project_id}
            onChange={(e) => setForm(prev => ({ ...prev, project_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Document'}
        </button>
      </div>
    </form>
  );
}
