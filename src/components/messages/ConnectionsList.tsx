"use client";

import Image from "next/image";
import { MessageCircle, User, Shield } from "lucide-react";
import { Connection, Profile } from "./types";

interface ConnectionsListProps {
  connections: Connection[];
  selectedConnection: Connection | null;
  unreadCounts: Record<string, number>;
  currentUserId: string;
  isProcessingRequest: boolean;
  onConnectionSelect: (connection: Connection) => void;
  onAcceptConnection: (connectionId: string) => void;
  onDeclineConnection: (connectionId: string) => void;
  getOtherUser: (connection: Connection) => Profile;
}

export const ConnectionsList = ({
  connections,
  selectedConnection,
  unreadCounts,
  currentUserId,
  isProcessingRequest,
  onConnectionSelect,
  onAcceptConnection,
  onDeclineConnection,
  getOtherUser,
}: ConnectionsListProps) => {
  return (
    <div className="w-1/3 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">
          {connections.length} connection{connections.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No connections yet</p>
            <p className="text-sm">Connect with founders to start messaging</p>
          </div>
        ) : (
          <div className="space-y-1">
            {connections.map((connection) => {
              const otherUser = getOtherUser(connection);
              const unreadCount = unreadCounts[connection.id] || 0;
              const isPendingRequest =
                connection.status === "pending" &&
                connection.addressee_id === currentUserId;

              if (isPendingRequest) {
                // Show connection request UI
                return (
                  <div
                    key={connection.id}
                    className={`w-full p-4 border-b border-gray-100 bg-yellow-50 ${
                      selectedConnection?.id === connection.id
                        ? "ring-2 ring-yellow-300"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => onConnectionSelect(connection)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          {otherUser.avatar_url ? (
                            <Image
                              src={otherUser.avatar_url}
                              alt={otherUser.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          {otherUser.id_verification && (
                            <div className="absolute -bottom-1 -right-1">
                              <Shield className="w-4 h-4 text-green-500 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser.name}
                          </p>
                          <p className="text-xs text-yellow-600 font-medium">
                            Connection Request
                          </p>
                        </div>
                      </div>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptConnection(connection.id);
                        }}
                        disabled={isProcessingRequest}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeclineConnection(connection.id);
                        }}
                        disabled={isProcessingRequest}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              }

              // Show regular connection UI
              return (
                <button
                  key={connection.id}
                  onClick={() => onConnectionSelect(connection)}
                  className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                    selectedConnection?.id === connection.id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {otherUser.avatar_url ? (
                        <Image
                          src={otherUser.avatar_url}
                          alt={otherUser.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                      {otherUser.id_verification && (
                        <div className="absolute -bottom-1 -right-1">
                          <Shield className="w-4 h-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherUser.name}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(connection.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
