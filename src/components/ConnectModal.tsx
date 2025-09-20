"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: {
    id: string;
    name: string | null;
    avatar_url?: string | null;
  };
  onSuccess?: () => void;
}

export default function ConnectModal({
  isOpen,
  onClose,
  mentor,
  onSuccess,
}: ConnectModalProps) {
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSendConnection = async () => {
    if (!mentor || !connectionMessage.trim()) return;

    setIsSendingRequest(true);
    const supabase = createClient();

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        return;
      }

      // Create connection request
      const { error } = await supabase.from("connections").insert({
        requester_id: user.id,
        addressee_id: mentor.id,
        message: connectionMessage.trim(),
        status: "pending",
      });

      if (error) {
        console.error("Error sending connection request:", error);
        alert("Failed to send connection request. Please try again.");
      } else {
        // Success - close modal and reset
        setConnectionMessage("");
        onClose();
        onSuccess?.();
        alert("Connection request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request. Please try again.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Send Connection Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You&apos;re about to send a connection request to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {mentor.name}
              </span>
              .
            </p>

            <label
              htmlFor="connection-message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Message <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              id="connection-message"
              value={connectionMessage}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setConnectionMessage(e.target.value);
                }
              }}
              placeholder="Add a personal message to your connection request..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {connectionMessage.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendConnection}
            disabled={!connectionMessage.trim() || isSendingRequest}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSendingRequest ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
