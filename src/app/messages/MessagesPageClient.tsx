"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import {
  ConnectionsList,
  ChatArea,
  Connection,
  Message,
  User,
  Profile,
} from "@/components/messages";

interface MessagesPageClientProps {
  initialConnections: Connection[];
  currentUser: User;
}

export default function MessagesPageClient({
  initialConnections,
  currentUser,
}: MessagesPageClientProps) {
  const [connections, setConnections] =
    useState<Connection[]>(initialConnections);
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isSending, setIsSending] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Latest message timestamps for sorting
  const [latestMessageTimestamps, setLatestMessageTimestamps] = useState<
    Record<string, string>
  >({});

  const supabase = createClient();
  const currentUserId = currentUser.id;

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    const chatContainer = document.querySelector(
      ".flex-1.overflow-y-auto.p-4.space-y-4"
    );
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Get the other user in a connection
  const getOtherUser = useCallback(
    (connection: Connection): Profile => {
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

  // Load messages for a connection
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
    [supabase, scrollToBottom]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (connectionId: string) => {
      try {
        // Update local message state immediately for better UX
        setMessages((prev) =>
          prev.map((msg) =>
            msg.connection_id === connectionId &&
            msg.receiver_id === currentUserId &&
            !msg.is_read
              ? { ...msg, is_read: true }
              : msg
          )
        );

        // Update database
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

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConnection || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      connection_id: selectedConnection.id,
      sender_id: currentUserId,
      receiver_id: getOtherUser(selectedConnection).id,
      content: messageContent,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          connection_id: selectedConnection.id,
          sender_id: currentUserId,
          receiver_id: getOtherUser(selectedConnection).id,
          content: messageContent,
          message_type: "text",
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
        setNewMessage(messageContent); // Restore message on error

        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
      } else {
        console.log("Message sent successfully:", data);

        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === optimisticMessage.id ? data : msg))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
      setNewMessage(messageContent); // Restore message on error

      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
    } finally {
      setIsSending(false);
    }
  };

  // Handle connection selection
  const handleConnectionSelect = (connection: Connection) => {
    setSelectedConnection(connection);
    setMessages([]);

    if (connection.status === "accepted") {
      loadMessages(connection.id);
      markMessagesAsRead(connection.id);
    }
    // For pending connections, we don't load messages but still allow selection
    // to show the connection request UI
  };

  // Handle accepting a connection request
  const handleAcceptConnection = async (connectionId: string) => {
    setIsProcessingRequest(true);
    try {
      // Update connection status to accepted
      const { error: updateError } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (updateError) {
        console.error("Error accepting connection:", updateError);
        alert("Failed to accept connection request. Please try again.");
        return;
      }

      // Update local state immediately while preserving profile data
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId ? { ...conn, status: "accepted" } : conn
        )
      );

      // Create initial message from the requester
      const connection = connections.find((c) => c.id === connectionId);
      if (connection) {
        const { error: messageError } = await supabase.from("messages").insert({
          connection_id: connectionId,
          sender_id: connection.requester_id,
          receiver_id: connection.addressee_id,
          content: "Connection request accepted! Let's start chatting.",
          message_type: "system",
          is_read: false,
        });

        if (messageError) {
          console.error("Error creating initial message:", messageError);
        }
      }

      // If this is the currently selected connection, load messages and mark as read
      if (selectedConnection?.id === connectionId) {
        loadMessages(connectionId);
        markMessagesAsRead(connectionId);
      }

      alert("Connection request accepted!");
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Failed to accept connection request. Please try again.");
    } finally {
      setIsProcessingRequest(false);
    }
  };

  // Handle declining a connection request
  const handleDeclineConnection = async (connectionId: string) => {
    setIsProcessingRequest(true);
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) {
        console.error("Error declining connection:", error);
        alert("Failed to decline connection request. Please try again.");
      } else {
        alert("Connection request declined.");
        // Remove from connections list
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      }
    } catch (error) {
      console.error("Error declining connection:", error);
      alert("Failed to decline connection request. Please try again.");
    } finally {
      setIsProcessingRequest(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const playPreview = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingPreview(false);
      audio.onplay = () => setIsPlayingPreview(true);
      audio.onpause = () => setIsPlayingPreview(false);
      audio.play();
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedConnection) return;

    setIsSending(true);
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const { data, error } = await supabase
          .from("messages")
          .insert({
            connection_id: selectedConnection.id,
            sender_id: currentUserId,
            receiver_id: getOtherUser(selectedConnection).id,
            content: base64Audio,
            message_type: "voice",
            is_read: false,
          })
          .select()
          .single();

        if (error) {
          console.error("Error sending voice message:", error);
          alert("Failed to send voice message. Please try again.");
        } else {
          console.log("Voice message sent successfully:", data);
          // Clear recording state
          setAudioBlob(null);
          setAudioUrl(null);
          setRecordingTime(0);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error sending voice message:", error);
      alert("Failed to send voice message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Image upload functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const sendImageMessage = async () => {
    if (!selectedImage || !selectedConnection) return;

    setIsSending(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const { data, error } = await supabase
          .from("messages")
          .insert({
            connection_id: selectedConnection.id,
            sender_id: currentUserId,
            receiver_id: getOtherUser(selectedConnection).id,
            content: base64Image,
            message_type: "image",
            is_read: false,
          })
          .select()
          .single();

        if (error) {
          console.error("Error sending image message:", error);
          alert("Failed to send image. Please try again.");
        } else {
          console.log("Image message sent successfully:", data);
          // Clear image state
          setSelectedImage(null);
          setImagePreview(null);
        }
      };

      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error("Error sending image message:", error);
      alert("Failed to send image. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // File upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedConnection) return;

    setIsSending(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result as string;

        // Store filename and base64 data as JSON
        const fileData = {
          filename: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: base64File,
        };

        const { data, error } = await supabase
          .from("messages")
          .insert({
            connection_id: selectedConnection.id,
            sender_id: currentUserId,
            receiver_id: getOtherUser(selectedConnection).id,
            content: JSON.stringify(fileData),
            message_type: "file",
            is_read: false,
          })
          .select()
          .single();

        if (error) {
          console.error("Error sending file message:", error);
          alert("Failed to send file. Please try again.");
        } else {
          console.log("File message sent successfully:", data);
          // Clear file state
          setSelectedFile(null);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error sending file message:", error);
      alert("Failed to send file. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📋";
      case "txt":
        return "📄";
      case "zip":
      case "rar":
        return "📦";
      default:
        return "📎";
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return;

    console.log("Setting up Supabase real-time subscriptions...");

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
          console.log("New message received:", newMessage);

          // Add message to current conversation if it belongs to the selected connection
          if (
            selectedConnection &&
            newMessage.connection_id === selectedConnection.id
          ) {
            setMessages((prev) => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some((msg) => msg.id === newMessage.id);
              if (exists) return prev;

              // If this is a message from the current user, it might be replacing an optimistic message
              if (newMessage.sender_id === currentUserId) {
                // Find and replace optimistic message with real message
                const optimisticIndex = prev.findIndex(
                  (msg) =>
                    msg.sender_id === currentUserId &&
                    msg.content === newMessage.content &&
                    msg.id.startsWith("temp-")
                );

                if (optimisticIndex !== -1) {
                  // Replace optimistic message
                  const updatedMessages = [...prev];
                  updatedMessages[optimisticIndex] = newMessage;
                  return updatedMessages;
                }
              }

              // For messages from other users or if no optimistic message found, add normally
              return [...prev, newMessage];
            });

            // Scroll to bottom when new message is added
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }

          // Update unread counts
          if (newMessage.receiver_id === currentUserId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMessage.connection_id]:
                (prev[newMessage.connection_id] || 0) + 1,
            }));
          }

          // Update latest message timestamp for sorting
          setLatestMessageTimestamps((prev) => ({
            ...prev,
            [newMessage.connection_id]: newMessage.created_at,
          }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          console.log("Message updated:", updatedMessage);

          // Update message in current conversation
          if (
            selectedConnection &&
            updatedMessage.connection_id === selectedConnection.id
          ) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === updatedMessage.id) {
                  // Preserve existing content if the updated message doesn't have it
                  // This prevents losing image/voice content when is_read status changes
                  const preservedMessage = {
                    ...updatedMessage,
                    content: updatedMessage.content || msg.content,
                  };

                  console.log("Preserving message content:", {
                    originalContent: msg.content
                      ? `${msg.content.substring(0, 50)}...`
                      : "empty",
                    updatedContent: updatedMessage.content
                      ? `${updatedMessage.content.substring(0, 50)}...`
                      : "empty",
                    finalContent: preservedMessage.content
                      ? `${preservedMessage.content.substring(0, 50)}...`
                      : "empty",
                    messageType: msg.message_type,
                  });

                  return preservedMessage;
                }
                return msg;
              })
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Messages subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Successfully subscribed to messages real-time updates"
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to messages real-time updates");
        } else if (status === "TIMED_OUT") {
          console.error("⏰ Timeout subscribing to messages real-time updates");
        } else if (status === "CLOSED") {
          console.warn("🔒 Messages real-time subscription closed");
        }
      });

    // Subscribe to connection updates
    const connectionsSubscription = supabase
      .channel("connections")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
        },
        async (payload) => {
          const newConnection = payload.new as Connection;
          console.log("New connection request received:", newConnection);

          // Add new connection request to the list if it's for the current user
          if (newConnection.addressee_id === currentUserId) {
            console.log("Adding new connection request to UI");

            // Fetch profile data for the new connection
            const userIds = [
              newConnection.requester_id,
              newConnection.addressee_id,
            ];
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, name, avatar_url, id_verification")
              .in("id", userIds);

            if (profilesError) {
              console.error(
                "Error fetching profiles for new connection:",
                profilesError
              );
            }

            // Add connection with profile data
            const connectionWithProfiles = {
              ...newConnection,
              requester: profiles?.find(
                (p) => p.id === newConnection.requester_id
              ),
              addressee: profiles?.find(
                (p) => p.id === newConnection.addressee_id
              ),
            };

            setConnections((prev) => {
              // Check if connection already exists to avoid duplicates
              const exists = prev.some((conn) => conn.id === newConnection.id);
              if (exists) {
                console.log("Connection already exists, skipping");
                return prev;
              }

              return [connectionWithProfiles, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
        },
        (payload) => {
          const updatedConnection = payload.new as Connection;
          console.log("Connection updated:", updatedConnection);

          // Update connections list while preserving existing profile data
          setConnections((prev) =>
            prev.map((conn) => {
              if (conn.id === updatedConnection.id) {
                console.log("Updating connection:", {
                  old: conn,
                  new: updatedConnection,
                  preservedRequester: conn.requester,
                  preservedAddressee: conn.addressee,
                });
                return {
                  ...updatedConnection,
                  requester: conn.requester, // Preserve existing profile data
                  addressee: conn.addressee, // Preserve existing profile data
                };
              }
              return conn;
            })
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "connections",
        },
        (payload) => {
          const deletedConnection = payload.old as Connection;
          console.log("Connection deleted:", deletedConnection);

          // Remove from connections list
          setConnections((prev) =>
            prev.filter((conn) => conn.id !== deletedConnection.id)
          );
        }
      )
      .subscribe((status) => {
        console.log("Connections subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Successfully subscribed to connections real-time updates"
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ Error subscribing to connections real-time updates"
          );
        } else if (status === "TIMED_OUT") {
          console.error(
            "⏰ Timeout subscribing to connections real-time updates"
          );
        } else if (status === "CLOSED") {
          console.warn("🔒 Connections real-time subscription closed");
        }
      });

    return () => {
      console.log("Cleaning up real-time subscriptions...");
      messagesSubscription.unsubscribe();
      connectionsSubscription.unsubscribe();
    };
  }, [currentUserId, selectedConnection, supabase, scrollToBottom]);

  // Load messages when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id);
      markMessagesAsRead(selectedConnection.id);
    }
  }, [selectedConnection, loadMessages, markMessagesAsRead]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load latest message timestamps for sorting
  const loadLatestMessageTimestamps = useCallback(async () => {
    if (connections.length === 0) return;

    try {
      const connectionIds = connections.map((conn) => conn.id);
      const { data, error } = await supabase
        .from("messages")
        .select("connection_id, created_at")
        .in("connection_id", connectionIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading latest message timestamps:", error);
      } else {
        const timestamps: Record<string, string> = {};
        data?.forEach((msg) => {
          if (!timestamps[msg.connection_id]) {
            timestamps[msg.connection_id] = msg.created_at;
          }
        });
        setLatestMessageTimestamps(timestamps);
      }
    } catch (error) {
      console.error("Error loading latest message timestamps:", error);
    }
  }, [connections, supabase]);

  // Load initial unread counts
  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("connection_id")
          .eq("receiver_id", currentUserId)
          .eq("is_read", false);

        if (!error && data) {
          const counts: Record<string, number> = {};
          data.forEach((msg) => {
            counts[msg.connection_id] = (counts[msg.connection_id] || 0) + 1;
          });
          setUnreadCounts(counts);
        }
      } catch (error) {
        console.error("Error loading unread counts:", error);
      }
    };

    if (currentUserId) {
      loadUnreadCounts();
    }
  }, [currentUserId, supabase]);

  // Load latest message timestamps when connections change
  useEffect(() => {
    if (connections.length > 0) {
      loadLatestMessageTimestamps();
    }
  }, [connections, loadLatestMessageTimestamps]);

  // Sort connections by latest message timestamp
  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) => {
      const timestampA = latestMessageTimestamps[a.id] || a.updated_at;
      const timestampB = latestMessageTimestamps[b.id] || b.updated_at;
      return new Date(timestampB).getTime() - new Date(timestampA).getTime();
    });
  }, [connections, latestMessageTimestamps]);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [recordingTimer, audioUrl]);

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex">
          <ConnectionsList
            connections={sortedConnections}
            selectedConnection={selectedConnection}
            unreadCounts={unreadCounts}
            currentUserId={currentUserId}
            isProcessingRequest={isProcessingRequest}
            onConnectionSelect={handleConnectionSelect}
            onAcceptConnection={handleAcceptConnection}
            onDeclineConnection={handleDeclineConnection}
            getOtherUser={getOtherUser}
          />

          <ChatArea
            selectedConnection={selectedConnection}
            messages={messages}
            isLoading={isLoading}
            currentUserId={currentUserId}
            getOtherUser={getOtherUser}
            formatFileSize={formatFileSize}
            getFileIcon={getFileIcon}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending}
            sendMessage={sendMessage}
            sendVoiceMessage={sendVoiceMessage}
            sendImageMessage={sendImageMessage}
            sendFileMessage={sendFileMessage}
            markMessagesAsRead={() => {
              if (selectedConnection) {
                markMessagesAsRead(selectedConnection.id);
              }
            }}
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
          />
        </div>
      </div>
    </div>
  );
}
