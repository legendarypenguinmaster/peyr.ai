"use client";

import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import UploadDocumentTab from "./UploadDocumentTab";
import LegalGenerator from "./LegalGenerator";

interface Project {
  id: string;
  name: string;
}

interface CreateDocumentModalProps {
  workspaceId: string;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDocumentModal({ workspaceId, projects, onClose, onSuccess }: CreateDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');

  const handleSuccess = () => {
    onSuccess();
    onClose();
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
        <UploadDocumentTab
          workspaceId={workspaceId}
          projects={projects}
          onSuccess={handleSuccess}
        />
      ) : (
        <LegalGenerator
          workspaceId={workspaceId}
          projects={projects}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
