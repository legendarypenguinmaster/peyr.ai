"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Image from "next/image";
import {
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  MoreVertical,
  Check,
  Clock,
} from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  id_verification: boolean;
}

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  requester: Profile;
  addressee: Profile;
}

interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface MessagesPageClientProps {
  initialConnections: Connection[];
  unreadCounts: Record<string, number>;
  currentUserId: string;
}

export default function MessagesPageClient({
  initialConnections,
  unreadCounts: initialUnreadCounts,
  currentUserId,
}: MessagesPageClientProps) {
  const [connections, setConnections] =
    useState<Connection[]>(initialConnections);
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] =
    useState<Record<string, number>>(initialUnreadCounts);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  // Deduplicate and sort messages to prevent duplicate keys
  const deduplicatedMessages = useMemo(() => {
    const messageMap = new Map<string, Message>();

    // Add all messages to map (later messages with same ID will overwrite earlier ones)
    messages.forEach((message) => {
      messageMap.set(message.id, message);
    });

    // Convert back to array and sort by created_at
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);
  const supabase = createClient();
  const previousMessagesLength = useRef(0);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    const chatContainer = document.querySelector(
      ".flex-1.overflow-y-auto.p-4.space-y-4"
    );
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const getOtherUser = useCallback(
    (connection: Connection) => {
      // Handle case where profile objects might be undefined (e.g., from real-time updates)
      if (connection.requester_id === currentUserId) {
        return (
          connection.addressee || {
            id: connection.addressee_id,
            name: "Unknown User",
            avatar_url: null,
            id_verification: false,
          }
        );
      } else {
        return (
          connection.requester || {
            id: connection.requester_id,
            name: "Unknown User",
            avatar_url: null,
            id_verification: false,
          }
        );
      }
    },
    [currentUserId]
  );

  const loadMessages = useCallback(
    async (connectionId: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("connection_id", connectionId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading messages:", error);
        } else {
          setMessages(data || []);
          // Reset the previous messages length when loading new conversation
          previousMessagesLength.current = (data || []).length;
          // Scroll to bottom when messages are loaded
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const markMessagesAsRead = useCallback(
    async (connectionId: string) => {
      try {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("connection_id", connectionId)
          .eq("receiver_id", currentUserId)
          .eq("is_read", false);

        // Update unread counts
        setUnreadCounts((prev) => ({
          ...prev,
          [connectionId]: 0,
        }));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [supabase, currentUserId]
  );

  // Test Supabase connection and real-time
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase
          .from("messages")
          .select("count")
          .limit(1);
        if (error) {
          console.error("Supabase connection error:", error);
        } else {
          console.log("Supabase connection successful");
        }
      } catch (err) {
        console.error("Supabase connection test failed:", err);
      }
    };

    // Test real-time subscription
    const testRealtime = () => {
      const testChannel = supabase
        .channel("test-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            console.log("Test real-time event received:", payload);
          }
        )
        .subscribe((status) => {
          console.log("Test real-time subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Real-time is working!");
            // Clean up test channel
            setTimeout(() => {
              supabase.removeChannel(testChannel);
            }, 1000);
          }
        });
    };

    testConnection();
    testRealtime();
  }, [supabase]);

  useEffect(() => {
    // Only scroll if new messages were added (not when switching conversations)
    if (deduplicatedMessages.length > previousMessagesLength.current) {
      // Get the last message
      const lastMessage = deduplicatedMessages[deduplicatedMessages.length - 1];

      if (lastMessage) {
        // Always scroll when current user sends a message
        if (lastMessage.sender_id === currentUserId) {
          scrollToBottom();
        }
        // Always scroll when receiving messages from others
        else {
          scrollToBottom();
        }
      }
    }
    previousMessagesLength.current = deduplicatedMessages.length;
  }, [deduplicatedMessages, currentUserId]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const connection = connections.find((conn) => {
          const otherUser = getOtherUser(conn);
          return otherUser.id === hash;
        });
        if (connection) {
          setSelectedConnection(connection);
        }
      } else {
        setSelectedConnection(null);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [connections, getOtherUser]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Add message to current conversation if it belongs to the selected connection
          if (
            selectedConnection &&
            newMessage.connection_id === selectedConnection.id
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }

          // Update unread counts
          if (newMessage.receiver_id === currentUserId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMessage.connection_id]:
                (prev[newMessage.connection_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to connection updates
    const connectionsSubscription = supabase
      .channel("connections")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connections",
        },
        (payload) => {
          const updatedConnection = payload.new as Connection;

          // Update connections list
          setConnections((prev) =>
            prev.map((conn) =>
              conn.id === updatedConnection.id ? updatedConnection : conn
            )
          );
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      connectionsSubscription.unsubscribe();
    };
  }, [selectedConnection, currentUserId, supabase]);

  // Load messages when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id);
      markMessagesAsRead(selectedConnection.id);
      // Scroll to bottom when switching conversations
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedConnection, loadMessages, markMessagesAsRead]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedConnection || !currentUserId) return;

    console.log(
      "Setting up real-time subscription for connection:",
      selectedConnection.id
    );

    const channel = supabase
      .channel(`messages:${selectedConnection.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${selectedConnection.id}`,
        },
        (payload) => {
          console.log("Real-time message received:", payload);
          const newMessage = payload.new as Message;

          // Skip processing if this is from the current user (to prevent duplicates)
          if (newMessage.sender_id === currentUserId) {
            console.log(
              "Skipping real-time message from current user to prevent duplicates"
            );
            return;
          }

          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;

            // Add message from other users
            return [...prev, newMessage];
          });

          // Mark as read if it's the current conversation and from another user
          if (
            selectedConnection &&
            selectedConnection.id === newMessage.connection_id &&
            newMessage.sender_id !== currentUserId
          ) {
            markMessagesAsRead(selectedConnection.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${selectedConnection.id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    return () => {
      console.log(
        "Cleaning up real-time subscription for connection:",
        selectedConnection.id
      );
      supabase.removeChannel(channel);
    };
  }, [selectedConnection, currentUserId, supabase, markMessagesAsRead]);

  // Real-time subscription for connection status updates
  useEffect(() => {
    if (!currentUserId) return;

    console.log(
      "Setting up real-time connection subscription for user:",
      currentUserId
    );

    const channel = supabase
      .channel(`connections:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
          filter: `requester_id=eq.${currentUserId},addressee_id=eq.${currentUserId}`,
        },
        (payload) => {
          const updatedConnection = payload.new as Connection;
          setConnections((prev) =>
            prev.map((conn) => {
              if (conn.id === updatedConnection.id) {
                // Preserve existing profile data if not present in update
                return {
                  ...updatedConnection,
                  requester: updatedConnection.requester || conn.requester,
                  addressee: updatedConnection.addressee || conn.addressee,
                };
              }
              return conn;
            })
          );

          // Update selected connection if it's the one being updated
          if (
            selectedConnection &&
            selectedConnection.id === updatedConnection.id
          ) {
            setSelectedConnection({
              ...updatedConnection,
              requester:
                updatedConnection.requester || selectedConnection.requester,
              addressee:
                updatedConnection.addressee || selectedConnection.addressee,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
          filter: `addressee_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newConnection = payload.new as Connection;
          // Add new connection to the list
          setConnections((prev) => {
            const exists = prev.some((conn) => conn.id === newConnection.id);
            if (exists) return prev;
            return [newConnection, ...prev];
          });
        }
      )
      .subscribe((status) => {
        console.log("Real-time connection subscription status:", status);
      });

    return () => {
      console.log(
        "Cleaning up real-time connection subscription for user:",
        currentUserId
      );
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedConnection, supabase, markMessagesAsRead]);

  // Don't render messages if currentUserId is not available
  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConnection) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    // Create optimistic message for instant feedback
    const tempMessage: Message = {
      id: `temp-${crypto.randomUUID()}`, // Prefix to identify optimistic messages
      connection_id: selectedConnection.id,
      sender_id: currentUserId,
      receiver_id:
        selectedConnection.requester_id === currentUserId
          ? selectedConnection.addressee_id
          : selectedConnection.requester_id,
      content: messageContent,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Ensure currentUserId is valid before creating optimistic message
    if (!currentUserId) {
      console.error("currentUserId is not available");
      setNewMessage(messageContent); // Restore message
      return;
    }

    // Add optimistic message immediately
    setMessages((prev) => [...prev, tempMessage]);

    // Scroll to bottom when user sends a message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          connection_id: selectedConnection.id,
          sender_id: currentUserId,
          receiver_id:
            selectedConnection.requester_id === currentUserId
              ? selectedConnection.addressee_id
              : selectedConnection.requester_id,
          content: messageContent,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setNewMessage(messageContent); // Restore message
      } else {
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? data : msg))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore message
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    setIsProcessingRequest(true);
    try {
      // First, update the connection status
      const { error: connectionError } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (connectionError) {
        console.error("Error accepting connection:", connectionError);
        alert("Failed to accept connection request. Please try again.");
        return;
      }

      // Find the connection to get the message
      const connection = connections.find((conn) => conn.id === connectionId);
      if (connection && connection.message && connection.message.trim()) {
        // Create the initial message from the connection request
        // Create it as the original requester (sender of the connection request)
        const { error: messageError } = await supabase.from("messages").insert({
          connection_id: connectionId,
          sender_id: connection.requester_id, // Original requester (sender)
          receiver_id: connection.addressee_id, // Current user (receiver)
          content: connection.message.trim(), // Original message without prefix
        });

        if (messageError) {
          console.error("Error creating initial message:", messageError);
          // Don't fail the whole operation, just log the error
        }
      }

      // Update the connection in the list
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId ? { ...conn, status: "accepted" } : conn
        )
      );

      // Update selected connection status
      if (selectedConnection && selectedConnection.id === connectionId) {
        setSelectedConnection((prev) =>
          prev ? { ...prev, status: "accepted" } : null
        );
      }

      alert("Connection request accepted!");
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Failed to accept connection request. Please try again.");
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleDeclineConnection = async (connectionId: string) => {
    setIsProcessingRequest(true);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "declined" })
        .eq("id", connectionId);

      if (error) {
        console.error("Error declining connection:", error);
        alert("Failed to decline connection request. Please try again.");
      } else {
        // Remove the connection from the list
        setConnections((prev) =>
          prev.filter((conn) => conn.id !== connectionId)
        );
        alert("Connection request declined.");
      }
    } catch (error) {
      console.error("Error declining connection:", error);
      alert("Failed to decline connection request. Please try again.");
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const getLastMessageTime = (connection: Connection) => {
    // This would ideally come from the database with the last message timestamp
    return new Date(connection.updated_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPendingRequest = (connection: Connection) => {
    return (
      connection.status === "pending" &&
      connection.addressee_id === currentUserId
    );
  };

  const handleConnectionSelect = (connection: Connection) => {
    setSelectedConnection(connection);
    const otherUser = getOtherUser(connection);
    // Update URL hash with user ID
    window.location.hash = otherUser.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Connect and chat with your co-founders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[100vh]">
          {/* Left Sidebar - Connections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversations
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {connections.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">
                      Connect with co-founders to start chatting
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {connections.map((connection) => {
                      const otherUser = getOtherUser(connection);
                      const unreadCount = unreadCounts[connection.id] || 0;

                      // Skip rendering if otherUser is still undefined
                      if (!otherUser) return null;

                      return (
                        <div
                          key={connection.id}
                          onClick={() => handleConnectionSelect(connection)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedConnection?.id === connection.id
                              ? "bg-blue-50 border-r-2 border-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {otherUser.avatar_url ? (
                                <Image
                                  src={otherUser.avatar_url}
                                  alt={otherUser.name || "User"}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                              )}
                              {otherUser.id_verification && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {otherUser.name || "Anonymous"}
                                  </p>
                                  {isPendingRequest(connection) && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {getLastMessageTime(connection)}
                                  </span>
                                  {unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {isPendingRequest(connection)
                                  ? "Connection request pending"
                                  : connection.message || "Connection request"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Area - Chat */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[500px] lg:h-[600px] flex flex-col">
              {selectedConnection ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {(() => {
                            const otherUser = getOtherUser(selectedConnection);
                            if (!otherUser) return null;
                            return otherUser.avatar_url ? (
                              <Image
                                src={otherUser.avatar_url}
                                alt={otherUser.name || "User"}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                            );
                          })()}
                          {getOtherUser(selectedConnection)
                            ?.id_verification && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getOtherUser(selectedConnection)?.name ||
                              "Anonymous"}
                          </h3>
                          <p className="text-sm text-gray-500">Co-founder</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages or Connection Request */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isPendingRequest(selectedConnection) ? (
                      // Connection Request Card
                      <div className="flex justify-center items-center h-full">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-md w-full">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Connection Request
                            </h3>
                            <p className="text-gray-600">
                              <span className="font-medium">
                                {getOtherUser(selectedConnection)?.name ||
                                  "Anonymous"}
                              </span>{" "}
                              wants to connect with you
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message:</span>
                            </p>
                            <p className="text-gray-600 mt-1">
                              {selectedConnection.message ||
                                "No message provided"}
                            </p>
                          </div>

                          <div className="flex space-x-3">
                            <button
                              onClick={() =>
                                handleDeclineConnection(selectedConnection.id)
                              }
                              disabled={isProcessingRequest}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() =>
                                handleAcceptConnection(selectedConnection.id)
                              }
                              disabled={isProcessingRequest}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isProcessingRequest ? "Processing..." : "Accept"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : deduplicatedMessages.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      deduplicatedMessages.map((message) => {
                        const isOwn = message.sender_id === currentUserId;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p
                                  className={`text-xs ${
                                    isOwn ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  {new Date(
                                    message.created_at
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
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
                      })
                    )}
                  </div>

                  {/* Message Input - Only show for accepted connections */}
                  {!isPendingRequest(selectedConnection) && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows={1}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p>
                      Choose a conversation from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
