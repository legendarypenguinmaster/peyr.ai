"use client";

import Image from "next/image";
import { Check, Clock, Download } from "lucide-react";
import { Message } from "./types";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileName: string) => string;
}

export const MessageItem = ({
  message,
  isOwn,
  formatFileSize,
  getFileIcon,
}: MessageItemProps) => {
  const renderMessageContent = () => {
    if (message.message_type === "voice" && message.content) {
      return <VoiceMessagePlayer audioData={message.content} isOwn={isOwn} />;
    }

    if (message.message_type === "image" && message.content) {
      return (
        <div className="max-w-xs">
          <Image
            src={message.content}
            alt="Shared image"
            width={200}
            height={200}
            className="rounded-lg object-cover"
            unoptimized
          />
        </div>
      );
    }

    if (message.message_type === "file" && message.content) {
      return (
        <div className="max-w-xs">
          {(() => {
            try {
              const fileData = JSON.parse(message.content);
              return (
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <div className="text-2xl">
                    {getFileIcon(fileData.filename || "file")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.filename || "Unknown file"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.size || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = fileData.data;
                      link.download = fileData.filename || "download";
                      link.click();
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            } catch {
              // Fallback for old format or corrupted data
              return (
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <div className="text-2xl">📎</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">File</p>
                    <p className="text-xs text-gray-500">Click to download</p>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = message.content;
                      link.download = "download";
                      link.click();
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            }
          })()}
        </div>
      );
    }

    return <p className="text-sm">{message.content}</p>;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        {renderMessageContent()}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwn && (
            <div className="ml-2">
              {message.is_read ? (
                <Check className="w-3 h-3 text-blue-300" />
              ) : (
                <Clock className="w-3 h-3 text-blue-200" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
