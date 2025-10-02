"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DocumentCard from "@/components/workspace/documents/DocumentCard";
import CreateDocumentModal from "@/components/workspace/documents/CreateDocumentModal";
import ViewDocumentModal from "@/components/workspace/documents/ViewDocumentModal";

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
            <DocumentCard
              key={doc.id}
              document={doc}
              onDocumentClick={handleDocumentClick}
              onDeleteClick={(doc) => {
                setDocumentToDelete(doc);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create Document Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidthClassName="max-w-4xl"
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