"use client";

import Image from "next/image";
import { MessageCircle, User, Shield } from "lucide-react";
import { Connection, Message, Profile } from "./types";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";

interface ChatAreaProps {
  selectedConnection: Connection | null;
  messages: Message[];
  isLoading: boolean;
  currentUserId: string;
  getOtherUser: (connection: Connection) => Profile;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileName: string) => string;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  sendMessage: () => void;
  sendVoiceMessage: () => void;
  sendImageMessage: () => void;
  sendFileMessage: () => void;
  markMessagesAsRead: () => void;
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
  selectedImage: File | null;
  imagePreview: string | null;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cancelImageUpload: () => void;
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cancelFileUpload: () => void;
}

export const ChatArea = ({
  selectedConnection,
  messages,
  isLoading,
  currentUserId,
  getOtherUser,
  formatFileSize,
  getFileIcon,
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
  audioUrl,
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
}: ChatAreaProps) => {
  if (!selectedConnection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a connection from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser(selectedConnection);

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {otherUser.avatar_url ? (
              <Image
                src={otherUser.avatar_url}
                alt={otherUser.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            {otherUser.id_verification && (
              <div className="absolute -bottom-1 -right-1">
                <Shield className="w-3 h-3 text-green-500 bg-white dark:bg-gray-800 rounded-full" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {otherUser.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedConnection.status === "pending"
                ? "Connection Request"
                : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {selectedConnection.status === "pending" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Connection Request
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {otherUser.name} wants to connect with you.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Accept the request to start messaging, or decline to remove it.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={isOwn}
                formatFileSize={formatFileSize}
                getFileIcon={getFileIcon}
              />
            );
          })
        )}
      </div>

      {/* Message Input - Only show for accepted connections */}
      {selectedConnection.status === "accepted" && (
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isSending={isSending}
          sendMessage={sendMessage}
          sendVoiceMessage={sendVoiceMessage}
          sendImageMessage={sendImageMessage}
          sendFileMessage={sendFileMessage}
          markMessagesAsRead={markMessagesAsRead}
          isRecording={isRecording}
          recordingTime={recordingTime}
          audioBlob={audioBlob}
          audioUrl={audioUrl}
          isPlayingPreview={isPlayingPreview}
          startRecording={startRecording}
          stopRecording={stopRecording}
          cancelRecording={cancelRecording}
          playPreview={playPreview}
          formatRecordingTime={formatRecordingTime}
          selectedImage={selectedImage}
          imagePreview={imagePreview}
          handleImageSelect={handleImageSelect}
          cancelImageUpload={cancelImageUpload}
          selectedFile={selectedFile}
          handleFileSelect={handleFileSelect}
          cancelFileUpload={cancelFileUpload}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
        />
      )}
    </div>
  );
};
