"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Image from "next/image";
import {
  MessageCircle,
  Send,
  Check,
  Clock,
  User,
  Shield,
  Mic,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  Paperclip,
  File,
  Download,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  id_verification: boolean;
}

interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
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

interface User {
  id: string;
  email?: string;
}

interface MessagesPageClientProps {
  initialConnections: Connection[];
  currentUser: User;
}

// Voice Message Player Component
const VoiceMessagePlayer = ({
  audioData,
  isOwn,
}: {
  audioData: string;
  isOwn: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    const audio = new Audio(audioData);
    setAudioElement(audio);

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, [audioData]);

  const togglePlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full ${
          isOwn
            ? "bg-blue-400 hover:bg-blue-300"
            : "bg-gray-300 hover:bg-gray-400"
        } transition-colors`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      <div className="flex-1">
        <div className="text-xs opacity-70">
          {isPlaying ? "Playing..." : "Voice message"}
        </div>
      </div>
    </div>
  );
};

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

  const supabase = createClient();
  const currentUserId = currentUser.id;
  const router = useRouter();
  const searchParams = useSearchParams();

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

    // Update URL with user parameter
    const params = new URLSearchParams();
    params.set("user", getOtherUser(connection).id);
    router.push(`/messages?${params.toString()}`);

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

  // Restore selected user from URL on page load
  useEffect(() => {
    const userIdFromUrl = searchParams.get("user");
    if (userIdFromUrl && connections.length > 0) {
      const connection = connections.find(
        (conn) => getOtherUser(conn).id === userIdFromUrl
      );
      if (connection && connection.id !== selectedConnection?.id) {
        setSelectedConnection(connection);
        setMessages([]);
        if (connection.status === "accepted") {
          loadMessages(connection.id);
          markMessagesAsRead(connection.id);
        }
      }
    }
  }, [
    searchParams,
    connections,
    selectedConnection,
    getOtherUser,
    loadMessages,
    markMessagesAsRead,
  ]);

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
          {/* Connections List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-500">
                {connections.length} connection
                {connections.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {connections.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No connections yet</p>
                  <p className="text-sm">
                    Connect with founders to start messaging
                  </p>
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
                            onClick={() => handleConnectionSelect(connection)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="relative">
                                {otherUser.avatar_url ? (
                                  <Image
                                    src={otherUser.avatar_url!}
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
                                handleAcceptConnection(connection.id);
                              }}
                              disabled={isProcessingRequest}
                              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineConnection(connection.id);
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
                        onClick={() => handleConnectionSelect(connection)}
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
                                src={otherUser.avatar_url!}
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
                              {new Date(
                                connection.updated_at
                              ).toLocaleDateString()}
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

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConnection ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {getOtherUser(selectedConnection).avatar_url ? (
                        <Image
                          src={getOtherUser(selectedConnection).avatar_url!}
                          alt={getOtherUser(selectedConnection).name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      {getOtherUser(selectedConnection).id_verification && (
                        <div className="absolute -bottom-1 -right-1">
                          <Shield className="w-3 h-3 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {getOtherUser(selectedConnection).name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConnection.status === "pending"
                          ? "Connection Request"
                          : "Online"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConnection.status === "pending" ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Connection Request
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {getOtherUser(selectedConnection).name} wants to
                          connect with you.
                        </p>
                        <p className="text-sm text-gray-500">
                          Accept the request to start messaging, or decline to
                          remove it.
                        </p>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">
                          Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
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
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            {message.message_type === "voice" &&
                            message.content ? (
                              <VoiceMessagePlayer
                                audioData={message.content}
                                isOwn={isOwn}
                              />
                            ) : message.message_type === "image" &&
                              message.content ? (
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
                            ) : message.message_type === "file" &&
                              message.content ? (
                              <div className="max-w-xs">
                                {(() => {
                                  try {
                                    const fileData = JSON.parse(
                                      message.content
                                    );
                                    return (
                                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                                        <div className="text-2xl">
                                          {getFileIcon(
                                            fileData.filename || "file"
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {fileData.filename ||
                                              "Unknown file"}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {formatFileSize(fileData.size || 0)}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const link =
                                              document.createElement("a");
                                            link.href = fileData.data;
                                            link.download =
                                              fileData.filename || "download";
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
                                          <p className="text-sm font-medium text-gray-900">
                                            File
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Click to download
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const link =
                                              document.createElement("a");
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
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString([], {
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
                    })
                  )}
                </div>

                {/* Message Input */}
                {selectedConnection.status === "accepted" && (
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
                              <p className="text-sm font-medium">
                                Voice Recording
                              </p>
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
                              <p className="text-xs text-gray-500">
                                {selectedImage?.name}
                              </p>
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
                            <div className="text-2xl">
                              {getFileIcon(selectedFile.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {selectedFile.name}
                              </p>
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
                        <div className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
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
                        <div className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      </label>

                      {/* Voice Recording Button */}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 rounded-lg transition-colors ${
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
                        onFocus={() => {
                          // Mark messages as read when user focuses on input field
                          if (selectedConnection) {
                            markMessagesAsRead(selectedConnection.id);
                          }
                        }}
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
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a connection from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
