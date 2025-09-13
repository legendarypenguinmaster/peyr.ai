"use client";

import Image from "next/image";
import {
  Send,
  Mic,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  sendMessage: () => void;
  sendVoiceMessage: () => void;
  sendImageMessage: () => void;
  sendFileMessage: () => void;
  markMessagesAsRead: () => void;

  // Voice recording state
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isPlayingPreview: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  playPreview: () => void;
  formatRecordingTime: (seconds: number) => string;

  // Image upload state
  selectedImage: File | null;
  imagePreview: string | null;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cancelImageUpload: () => void;

  // File upload state
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cancelFileUpload: () => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileName: string) => string;
}

export const MessageInput = ({
  newMessage,
  setNewMessage,
  isSending,
  sendMessage,
  sendVoiceMessage,
  sendImageMessage,
  sendFileMessage,
  markMessagesAsRead,
  isRecording,
  recordingTime,
  audioBlob,
  isPlayingPreview,
  startRecording,
  stopRecording,
  cancelRecording,
  playPreview,
  formatRecordingTime,
  selectedImage,
  imagePreview,
  handleImageSelect,
  cancelImageUpload,
  selectedFile,
  handleFileSelect,
  cancelFileUpload,
  formatFileSize,
  getFileIcon,
}: MessageInputProps) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Voice Recording Preview */}
      {audioBlob && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={playPreview}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                {isPlayingPreview ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <div>
                <p className="text-sm font-medium">Voice Recording</p>
                <p className="text-xs text-gray-500">
                  {formatRecordingTime(recordingTime)}
                </p>
              </div>
            </div>
            <button
              onClick={cancelRecording}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-sm font-medium">Image</p>
                <p className="text-xs text-gray-500">{selectedImage?.name}</p>
              </div>
            </div>
            <button
              onClick={cancelImageUpload}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getFileIcon(selectedFile.name)}</div>
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={cancelFileUpload}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {/* File Upload Button */}
        <label className="cursor-pointer">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSending}
          />
          <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
            <Paperclip className="w-5 h-5" />
          </div>
        </label>

        {/* Image Upload Button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isSending}
          />
          <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </label>

        {/* Voice Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={isSending}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={markMessagesAsRead}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSending}
        />

        {/* Send Button */}
        <button
          onClick={
            audioBlob
              ? sendVoiceMessage
              : selectedImage
              ? sendImageMessage
              : selectedFile
              ? sendFileMessage
              : sendMessage
          }
          disabled={
            isSending ||
            (!newMessage.trim() &&
              !audioBlob &&
              !selectedImage &&
              !selectedFile)
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Recording... {formatRecordingTime(recordingTime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
