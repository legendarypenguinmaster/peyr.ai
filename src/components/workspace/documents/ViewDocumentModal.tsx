"use client";

import { FileText, Download } from "lucide-react";
import Image from "next/image";

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

interface ViewDocumentModalProps {
  document: Document | null;
  onClose: () => void;
  onDownloadDocument: (document: Document) => void;
}

export default function ViewDocumentModal({ document, onClose, onDownloadDocument }: ViewDocumentModalProps) {
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
