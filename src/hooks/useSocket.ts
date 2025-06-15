import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  senderName?: string;
}

interface UseSocketProps {
  onNewMessage?: (message: Message) => void;
  onUserStatusChanged?: (data: { userId: string; isOnline: boolean }) => void;
  onUserTyping?: (data: {
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
  onMessagesRead?: (data: { messageIds: string[]; readBy: string }) => void;
}

export const useSocket = ({
  onNewMessage,
  onUserStatusChanged,
  onUserTyping,
  onMessagesRead,
}: UseSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // For HTTP-only cookies, we need to get the token from the server
    const getAuthToken = async () => {
      try {
        // First try to get from a non-HTTP-only token that we stored
        const clientToken = localStorage.getItem("socket-auth-token");
        if (clientToken) {
          return clientToken;
        }

        // Get token from server endpoint that can access HTTP-only cookies
        const response = await fetch("/api/auth/socket-token", {
          credentials: "include", // Include cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem("socket-auth-token", data.token);
            return data.token;
          }
        }

        return null;
      } catch (error) {
        console.error("Error getting auth token for WebSocket:", error);
        return null;
      }
    };

    const initializeSocket = async () => {
      const token = await getAuthToken();

      if (!token) {
        console.log("No auth token found, cannot connect to socket");
        setConnectionError("No authentication token found");
        return;
      }

      console.log("Initializing socket connection with token...");

      // Initialize socket connection
      socketRef.current = io({
        path: "/api/socketio",
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"], // Allow fallback to polling
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("✅ Connected to WebSocket server");
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from WebSocket server:", reason);
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("🔴 Socket connection error:", error);
        setIsConnected(false);
        setConnectionError(error.message);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(
          "🔄 Reconnected to WebSocket server after",
          attemptNumber,
          "attempts"
        );
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on("reconnect_error", (error) => {
        console.error("🔴 Reconnection failed:", error);
        setConnectionError("Reconnection failed");
      });

      // Message handlers
      if (onNewMessage) {
        socket.on("new-message", (message: Message) => {
          console.log("📨 Received new message via WebSocket:", message);
          onNewMessage(message);
        });
      }

      if (onUserStatusChanged) {
        socket.on(
          "user-status-changed",
          (data: { userId: string; isOnline: boolean }) => {
            console.log("👤 User status changed:", data);
            onUserStatusChanged(data);
          }
        );
      }

      if (onUserTyping) {
        socket.on(
          "user-typing",
          (data: { userId: string; userName: string; isTyping: boolean }) => {
            console.log("⌨️ User typing:", data);
            onUserTyping(data);
          }
        );
      }

      if (onMessagesRead) {
        socket.on(
          "messages-read",
          (data: { messageIds: string[]; readBy: string }) => {
            console.log("✓ Messages marked as read:", data);
            onMessagesRead(data);
          }
        );
      }

      return () => {
        console.log("🔌 Cleaning up socket connection");
        socket.disconnect();
      };
    };

    initializeSocket();
  }, [onNewMessage, onUserStatusChanged, onUserTyping, onMessagesRead]);

  const joinConversation = useCallback((doctorIds: string[]) => {
    if (socketRef.current?.connected) {
      console.log("🚪 Joining conversation:", doctorIds);
      socketRef.current.emit("join-conversation", doctorIds);
    }
  }, []);

  const leaveConversation = useCallback((doctorIds: string[]) => {
    if (socketRef.current?.connected) {
      console.log("🚪 Leaving conversation:", doctorIds);
      socketRef.current.emit("leave-conversation", doctorIds);
    }
  }, []);

  const sendMessage = useCallback(
    (receiverId: string, message: string, messageId: string) => {
      if (socketRef.current?.connected) {
        console.log("📤 Sending message via WebSocket:", {
          receiverId,
          message,
          messageId,
        });
        socketRef.current.emit("send-message", {
          receiverId,
          message,
          messageId,
        });
        return true;
      } else {
        console.warn("⚠️ Socket not connected, cannot send message");
        return false;
      }
    },
    []
  );

  const sendTyping = useCallback((receiverId: string, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", {
        receiverId,
        isTyping,
      });
    }
  }, []);

  const updateStatus = useCallback((isOnline: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("update-status", isOnline);
    }
  }, []);

  const markMessagesAsRead = useCallback(
    (messageIds: string[], senderId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("mark-read", {
          messageIds,
          senderId,
        });
      }
    },
    []
  );

  return {
    isConnected,
    connectionError,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    updateStatus,
    markMessagesAsRead,
  };
};
