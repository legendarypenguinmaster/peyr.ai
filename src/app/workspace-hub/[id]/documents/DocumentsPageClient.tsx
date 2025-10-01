"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Upload, Sparkles, Download, Trash2, X } from "lucide-react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

interface Document {
  id: string;
  title: string;
  type: string;
  project_id: string | null;
  project_name?: string;
  created_by: string;
  creator_name?: string;
  creator_avatar_url?: string;
  created_at?: string;
  updated_at: string;
  file_url?: string;
  content?: string;
  size_bytes?: number;
}

interface Project {
  id: string;
  name: string;
}

interface DocumentsPageClientProps {
  workspaceId: string;
  workspaceName: string;
  projects: Project[];
  currentUserId: string;
}

type FilterTab = 'all' | 'my' | 'shared' | 'contracts' | 'ai';

export default function DocumentsPageClient({ 
  workspaceId, 
  workspaceName, 
  projects, 
  currentUserId 
}: DocumentsPageClientProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filterTabs = [
    { id: 'all' as FilterTab, label: 'All Documents', count: 0 },
    { id: 'my' as FilterTab, label: 'My Documents', count: 0 },
    { id: 'shared' as FilterTab, label: 'Shared Workspace Docs', count: 0 },
    { id: 'contracts' as FilterTab, label: 'Contracts & Legal', count: 0 },
    { id: 'ai' as FilterTab, label: 'AI Outputs', count: 0 },
  ];

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching documents');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const filterDocuments = useCallback(() => {
    let filtered = documents;

    switch (activeFilter) {
      case 'my':
        filtered = documents.filter(doc => doc.created_by === currentUserId);
        break;
      case 'shared':
        filtered = documents; // All documents in workspace are shared
        break;
      case 'contracts':
        filtered = documents.filter(doc => 
          doc.type === 'contract' || doc.type === 'legal'
        );
        break;
      case 'ai':
        filtered = documents.filter(doc => doc.type === 'ai');
        break;
      default:
        filtered = documents;
    }

    setFilteredDocuments(filtered);
  }, [documents, activeFilter, currentUserId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const updateFilterCounts = () => {
    const counts = {
      all: documents.length,
      my: documents.filter(doc => doc.created_by === currentUserId).length,
      shared: documents.length,
      contracts: documents.filter(doc => 
        doc.type === 'contract' || doc.type === 'legal'
      ).length,
      ai: documents.filter(doc => doc.type === 'ai').length,
    };
    return counts;
  };

  const counts = updateFilterCounts();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const humanFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    if (doc.file_url) {
      try {
        const response = await fetch(doc.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.title || 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading document:', error);
        // Fallback to opening in new tab if download fails
        window.open(doc.file_url, '_blank');
      }
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      setDeleting(true);
      console.log('Starting delete for document:', doc.id, doc.title);
      
      // Delete from workspace_documents bucket if file exists
      if (doc.file_url) {
        // Extract file path from URL
        const urlParts = doc.file_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${workspaceId}/documents/${fileName}`;
        
        console.log('Deleting file from bucket:', filePath);
        
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        // Delete from storage bucket
        const { error: bucketError } = await supabase.storage
          .from('workspace_documents')
          .remove([filePath]);
        
        if (bucketError) {
          console.error('Error deleting file from bucket:', bucketError);
        } else {
          console.log('Successfully deleted file from bucket');
        }
        
        // No workspace_documents_meta table in this setup; skip
      }
      
      // Delete from workspace_documents table
      const deleteUrl = `/api/workspaces/${workspaceId}/documents/${doc.id}`;
      console.log('Calling DELETE API for document:', doc.id);
      console.log('DELETE URL:', deleteUrl);
      
      // First, let's test if the route is accessible with a GET request
      try {
        const testResponse = await fetch(deleteUrl, { method: 'GET' });
        console.log('Test GET response status:', testResponse.status);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Test GET response data:', testData);
        }
      } catch (testError) {
        console.error('Test GET request failed:', testError);
      }
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });
      
      console.log('Delete API response status:', response.status);
      console.log('Delete API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Delete API error:', errorData);
        throw new Error(`Failed to delete document: ${errorData.error || 'Unknown error'}`);
      }
      
      console.log('Successfully deleted document from database');
      
      // Refresh documents list
      await fetchDocuments();
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {workspaceName} • {documents.length} documents
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFilter === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {activeFilter === 'all' 
              ? 'Get started by creating your first document to organize your workspace files.'
              : `No documents match the "${filterTabs.find(t => t.id === activeFilter)?.label}" filter`
            }
          </p>
          {activeFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc)}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {doc.type}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentToDelete(doc);
                    setShowDeleteModal(true);
                  }}
                  className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-lg">
                {doc.title}
              </h3>
              
              {doc.project_name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md inline-block">
                  📁 {doc.project_name}
                </p>
              )}
              
              {doc.size_bytes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  📄 {humanFileSize(doc.size_bytes)}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4">
                <div className="flex items-center gap-2">
                  {doc.creator_avatar_url ? (
                    <Image
                      src={doc.creator_avatar_url}
                      alt={doc.creator_name || 'Creator'}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-[10px] font-medium">
                        {(doc.creator_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>{doc.creator_name || 'Unknown'}</span>
                </div>
                <span>{formatDate(doc.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Document Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidthClassName="max-w-2xl"
      >
        <CreateDocumentModal
          workspaceId={workspaceId}
          projects={projects}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDocuments();
          }}
        />
      </Modal>

      {/* View Document Modal */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        maxWidthClassName="max-w-2xl"
      >
        <ViewDocumentModal
          document={selectedDocument}
          onClose={() => setShowViewModal(false)}
          onDownloadDocument={handleDownloadDocument}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Delete document</div>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete &quot;{documentToDelete.title}&quot;? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button 
                disabled={deleting} 
                onClick={() => handleDeleteDocument(documentToDelete)} 
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Document Modal Component
interface CreateDocumentModalProps {
  workspaceId: string;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateDocumentModal({ workspaceId, projects, onClose, onSuccess }: CreateDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');
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

  const generateAIDescription = async () => {
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
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Modal Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-6 py-3 text-sm font-medium ${
            activeTab === 'upload'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Document
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-6 py-3 text-sm font-medium ${
            activeTab === 'create'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Create New
        </button>
      </div>

      {activeTab === 'upload' ? (
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
                  onClick={generateAIDescription}
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
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create new documents from scratch will be available soon.
          </p>
        </div>
      )}
    </div>
  );
}

// View Document Modal Component
interface ViewDocumentModalProps {
  document: Document | null;
  onClose: () => void;
  onDownloadDocument: (document: Document) => void;
}

function ViewDocumentModal({ document, onClose, onDownloadDocument }: ViewDocumentModalProps) {
  if (!document) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {document.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {document.type}
              </p>
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{document.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                  {document.type}
                </span>
              </div>

              {document.project_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-gray-500">📁</span>
                    {document.project_name}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creator
                </label>
                <div className="flex items-center gap-2">
                  {document.creator_avatar_url ? (
                    <Image
                      src={document.creator_avatar_url}
                      alt={document.creator_name || 'Creator'}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {(document.creator_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-900 dark:text-white">
                    {document.creator_name || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(document.created_at || document.updated_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDateTime(document.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          {document.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {document.content}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {document.file_url && (
            <button
              onClick={() => onDownloadDocument(document)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
