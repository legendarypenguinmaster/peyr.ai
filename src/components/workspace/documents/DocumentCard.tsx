"use client";

import { FileText, Trash2 } from "lucide-react";
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

interface DocumentCardProps {
  document: Document;
  onDocumentClick: (document: Document) => void;
  onDeleteClick: (document: Document) => void;
}

export default function DocumentCard({ document, onDocumentClick, onDeleteClick }: DocumentCardProps) {
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

  return (
    <div
      onClick={() => onDocumentClick(document)}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {document.type}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(document);
          }}
          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-lg">
        {document.title}
      </h3>
      
      {document.project_name && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md inline-block">
          📁 {document.project_name}
        </p>
      )}
      
      {document.size_bytes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          📄 {humanFileSize(document.size_bytes)}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4">
        <div className="flex items-center gap-2">
          {document.creator_avatar_url ? (
            <Image
              src={document.creator_avatar_url}
              alt={document.creator_name || 'Creator'}
              width={16}
              height={16}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-[10px] font-medium">
                {(document.creator_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span>{document.creator_name || 'Unknown'}</span>
        </div>
        <span>{formatDate(document.updated_at)}</span>
      </div>
    </div>
  );
}
