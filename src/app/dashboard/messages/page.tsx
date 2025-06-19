"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Search,
  Stethoscope,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartPolling } from "@/hooks/useSmartPolling";

// Type definitions
interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  senderName?: string;
}

interface Conversation {
  doctorId: string;
  doctorName: string;
  specialization: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Helper function to format timestamps
const formatMessageTime = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInHours = Math.floor(
    (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60)
    );
    return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? "1d" : `${diffInDays}d`;
  }
};

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smart polling for messages
  const pollForMessages = useCallback(async () => {
    if (!selectedDoctor || !user) return;

    try {
      const response = await fetch(
        `/api/doctor-messages?with=${selectedDoctor._id}&since=${Date.now() - 30000}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages?.length > 0) {
          setMessages((prev) => {
            const newMessages = data.messages.filter(
              (msg: Message) =>
                !prev.some((existingMsg) => existingMsg._id === msg._id)
            );
            return [...prev, ...newMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          });
        }
      }
    } catch (error) {
      console.error("Error polling for messages:", error);
      throw error; // Let smart polling handle the error
    }
  }, [selectedDoctor, user]);

  // Initialize smart polling
  const { isConnected, isIntensiveMode, markActivity, getPollingStatus } =
    useSmartPolling(pollForMessages, !!selectedDoctor && !!user, {
      intensiveInterval: 1000, // Poll every 1 second when chat is active
      normalInterval: 5000, // Poll every 5 seconds when idle
      idleTimeout: 30000, // Switch to normal mode after 30 seconds of inactivity
      maxRetries: 3,
    });
  // Log polling status changes (for development)
  useEffect(() => {
    const status = getPollingStatus();
    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📡 Polling Status: ${status.mode} mode (${status.interval}ms) - Connected: ${status.connected}`
      );
    }
  }, [isIntensiveMode, isConnected, getPollingStatus]); // Simple functions for conversation management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const joinConversation = (doctorId: string) => {
    markActivity(); // Start intensive polling when joining a conversation
  };

  const leaveConversation = () => {
    // Activity will naturally timeout to normal polling
  }; // Fetch all doctors for messaging
  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors/list");

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setDoctors(data.doctors);
        } else {
          console.error("Doctors API returned success: false", data.message);
        }
      } else {
        console.error("Doctors API request failed:", response.status);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/doctor-messages");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversations(data.conversations || []);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages with a specific doctor
  const fetchMessages = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-messages?with=${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || []);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send a message  // Send a message using the smart polling approach
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedDoctor || sendingMessage || !user)
      return;
    setSendingMessage(true);
    markActivity(); // Mark activity to trigger intensive polling

    try {
      const response = await fetch("/api/doctor-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedDoctor._id,
          message: messageInput.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessageInput("");
          // Refresh messages immediately
          await fetchMessages(selectedDoctor._id);
          // Refresh conversations to update unread counts
          await fetchConversations();
        } else {
          console.error("❌ Message send failed:", data.message);
        }
      } else {
        console.error("❌ Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  }; // Mark messages as read
  const markAsRead = async (doctorId: string) => {
    try {
      const response = await fetch("/api/doctor-messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: doctorId,
        }),
      });

      if (response.ok) {
        // Messages marked as read successfully
      } else {
        console.error(`❌ Failed to mark messages as read:`, response.status);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };
  const handleDoctorSelect = async (doctor: Doctor) => {
    if (!user) return;

    // Leave previous conversation room if any
    if (selectedDoctor) {
      leaveConversation();
    }
    setSelectedDoctor(doctor);

    // Join new conversation room
    joinConversation(doctor._id);

    await fetchMessages(doctor._id);
    await markAsRead(doctor._id);

    // Small delay to ensure server processing, then refresh conversations
    setTimeout(async () => {
      await fetchConversations(); // Refresh to update unread count
    }, 100);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    markActivity(); // Mark activity on typing
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark activity when user types
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    markActivity(); // Mark activity on input change
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDoctors(), fetchConversations()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
  const chatContainer = messagesEndRef.current?.parentElement;
  if (!chatContainer) return;

  const isNearBottom =
    chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;

  if (isNearBottom) {
    scrollToBottom();
  }
}, [messages]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesName = doctor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialization = doctor.specialization
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesName || matchesSpecialization;
  });
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center bg-background">
          <div
            className="flex flex-col items-center space-y-4 text-center"
            style={{ animation: "fadeIn 0.6s ease-out" }}
          >
            <div
              className="relative"
              style={{ animation: "scaleIn 0.6s ease-out 0.2s both" }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-8 w-8 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            </div>
            <div
              className="space-y-2"
              style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
            >
              <span className="text-lg font-semibold text-foreground">
                Loading messages...
              </span>
              <p className="text-sm text-muted-foreground">
                Connecting to the message system
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {" "}
        {/* Enhanced Sidebar - Doctor List with Dashboard-style Design */}
        <div
          className="w-80 bg-gradient-to-b from-card via-card to-muted/5 border-r border-border/40 flex flex-col transition-all duration-500 ease-out shadow-xl shadow-black/5"
          style={{
            animation: "slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Enhanced Header with Dashboard-style Gradient */}
          <div className="relative p-6 border-b border-border/40 bg-gradient-to-br from-blue-50/50 via-card to-indigo-50/30 dark:from-blue-950/30 dark:via-card dark:to-indigo-950/20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full -translate-y-16 translate-x-16 dark:from-blue-400/10"></div>

            <div
              className="group mb-6 relative z-10"
              style={{
                animation:
                  "fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="transition-all duration-500 ease-out group-hover:scale-105 group-hover:translate-x-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 transition-all duration-300">
                        Doctor Messages
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground transition-all duration-500 group-hover:text-blue-600 group-hover:translate-x-2 ml-14">
                    Connect with colleagues
                  </p>
                </div>

                {/* Enhanced Connection Status with Dashboard-style Badge */}
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-500 backdrop-blur-sm ${
                    isConnected
                      ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200/50 shadow-lg shadow-emerald-500/20 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300 dark:border-emerald-800/50"
                      : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200/50 shadow-lg shadow-red-500/20 dark:from-red-900/40 dark:to-rose-900/40 dark:text-red-300 dark:border-red-800/50"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      isConnected
                        ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/50 animate-pulse"
                        : "bg-gradient-to-r from-red-400 to-rose-500 shadow-lg shadow-red-400/50"
                    } ${isIntensiveMode ? "animate-bounce" : ""}`}
                  ></div>
                  <span className="font-bold tracking-wide">
                    {isConnected ? "LIVE" : "OFFLINE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Search with Dashboard-style Glass Effect */}
            <div
              className="relative group"
              style={{
                animation:
                  "fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-all duration-500 group-hover:text-blue-500 group-hover:scale-110 z-10" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full pl-12 pr-4 py-3 border border-border/50 rounded-xl bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground shadow-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-500 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/10 focus:scale-[1.02] z-10"
              />
            </div>
          </div>
          {/* Doctor List */}
          <div
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
            style={{ animation: "fadeInUp 0.6s ease-out 0.6s both" }}
          >
            {filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <div
                  className="bg-muted/50 rounded-full p-6 mb-4 transition-all duration-300 hover:scale-110"
                  style={{ animation: "scaleIn 0.6s ease-out 0.8s both" }}
                >
                  <MessageSquare className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-center font-medium">No doctors found</p>
                <p className="text-sm text-muted-foreground/80 text-center mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredDoctors.map((doctor, index) => {
                  const conversation = conversations.find(
                    (c) => c.doctorId === doctor._id
                  );
                  return (
                    <div
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 ease-out border border-transparent ${
                        selectedDoctor?._id === doctor._id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/10 scale-[1.02]"
                          : "hover:bg-muted/50 hover:border-border/50 hover:shadow-md hover:scale-[1.01]"
                      }`}
                      style={{
                        animation: `slideInUp 0.6s ease-out ${index * 0.1 + 0.8}s both`,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              selectedDoctor?._id === doctor._id
                                ? "bg-blue-600 shadow-lg shadow-blue-500/25 scale-110"
                                : "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 group-hover:shadow-md group-hover:scale-105"
                            }`}
                          >
                            <Stethoscope
                              className={`h-6 w-6 transition-colors duration-300 ${
                                selectedDoctor?._id === doctor._id
                                  ? "text-white"
                                  : "text-blue-600 dark:text-blue-400"
                              }`}
                            />
                          </div>

                          {/* Unread count badge with modern design */}
                          {conversation && conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                              {conversation.unreadCount > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold truncate transition-colors duration-300 ${
                                  selectedDoctor?._id === doctor._id
                                    ? "text-blue-900 dark:text-blue-100"
                                    : "text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                }`}
                              >
                                Dr. {doctor.name}
                              </p>
                              <p
                                className={`text-xs truncate transition-colors duration-300 ${
                                  selectedDoctor?._id === doctor._id
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-muted-foreground group-hover:text-blue-600"
                                }`}
                              >
                                {doctor.specialization}
                              </p>
                            </div>

                            <div className="flex flex-col items-end space-y-1">
                              {conversation?.lastMessageTime && (
                                <span
                                  className={`text-xs font-medium transition-colors duration-300 ${
                                    selectedDoctor?._id === doctor._id
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-muted-foreground group-hover:text-blue-500"
                                  }`}
                                >
                                  {formatMessageTime(
                                    conversation.lastMessageTime
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {conversation?.lastMessage && (
                            <div className="mt-2">
                              <p
                                className={`text-xs truncate transition-colors duration-300 ${
                                  selectedDoctor?._id === doctor._id
                                    ? "text-blue-800 dark:text-blue-200"
                                    : conversation.unreadCount > 0
                                      ? "text-foreground font-medium"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {conversation.lastMessage.length > 45
                                  ? `${conversation.lastMessage.substring(0, 45)}...`
                                  : conversation.lastMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div
                        className={`absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full transition-all duration-300 ${
                          selectedDoctor?._id === doctor._id
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-50 group-hover:opacity-50"
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>{" "}
        {/* Main Chat Area */}
        <div
          className="flex-1 flex flex-col bg-background transition-all duration-300 ease-out"
          style={{ animation: "slideInRight 0.6s ease-out 0.2s both" }}
        >
          {selectedDoctor ? (
            <>
              {/* Chat Header with modern dashboard styling */}
              <div
                className="bg-gradient-to-r from-card to-muted/20 border-b border-border/40 p-6 transition-all duration-300 ease-out"
                style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 group">
                    <div className="relative transition-all duration-300 group-hover:scale-105">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/25">
                        <Stethoscope className="h-7 w-7 text-white" />
                      </div>
                      {/* Activity pulse ring */}
                      {isIntensiveMode && (
                        <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-ping opacity-75"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground transition-all duration-300 group-hover:text-blue-600">
                        Dr. {selectedDoctor.name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold transition-all duration-300 group-hover:scale-105">
                          {selectedDoctor.specialization}
                        </p>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-lg ${
                              isConnected
                                ? isIntensiveMode
                                  ? "bg-green-500 animate-pulse shadow-green-500/50"
                                  : "bg-blue-500 shadow-blue-500/50"
                                : "bg-red-500 shadow-red-500/50"
                            }`}
                            title={`Polling: ${
                              isIntensiveMode ? "Intensive (1s)" : "Normal (5s)"
                            } - ${isConnected ? "Connected" : "Disconnected"}`}
                          ></div>
                          <span className="text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:text-blue-500">
                            {isIntensiveMode ? "Real-time active" : "Connected"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat actions with modern styling */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105 focus-ring">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>{" "}
              {/* Messages with modern styling */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/20 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                style={{ animation: "fadeInUp 0.6s ease-out 0.6s both" }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 shadow-lg mb-6 transition-all duration-300 hover:scale-105"
                      style={{ animation: "scaleIn 0.6s ease-out 0.8s both" }}
                    >
                      <MessageSquare className="h-16 w-16 text-blue-500 mx-auto" />
                    </div>
                    <div
                      className="text-center space-y-3"
                      style={{ animation: "fadeInUp 0.6s ease-out 1.0s both" }}
                    >
                      <h3 className="text-lg font-semibold text-foreground">
                        No messages yet
                      </h3>
                      <p className="text-center max-w-sm text-muted-foreground leading-relaxed">
                        Start a conversation with Dr. {selectedDoctor.name}!
                        Share medical insights, discuss cases, or collaborate on
                        patient care.
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 font-medium mt-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Start typing below to begin</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId !== selectedDoctor._id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1]?.senderId !== message.senderId;
                      const nextMessage = messages[index + 1];
                      const isLastInGroup =
                        !nextMessage ||
                        nextMessage.senderId !== message.senderId;

                      return (
                        <div
                          key={message._id}
                          className={`flex items-end transition-all duration-300 ease-out ${
                            isOwn ? "justify-end" : "justify-start"
                          } ${isLastInGroup ? "mb-6" : "mb-2"}`}
                          style={{
                            animation: `slideInUp 0.4s ease-out ${index * 0.05}s both`,
                          }}
                        >
                          {!isOwn && (
                            <div
                              className={`mr-3 transition-all duration-300 ${
                                showAvatar
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-95 pointer-events-none"
                              }`}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex items-center justify-center shadow-sm border border-border/50">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {selectedDoctor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="max-w-xs lg:max-w-md group">
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                                isOwn
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                                  : "bg-card border border-border/50 text-foreground hover:shadow-md hover:border-border"
                              } group-hover:scale-[1.02]`}
                              style={{
                                borderBottomRightRadius:
                                  isOwn && isLastInGroup ? "8px" : "16px",
                                borderBottomLeftRadius:
                                  !isOwn && isLastInGroup ? "8px" : "16px",
                              }}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.message}
                              </p>
                              {isLastInGroup && (
                                <div
                                  className={`flex items-center mt-3 space-x-2 ${
                                    isOwn ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <span
                                    className={`text-xs font-medium ${
                                      isOwn
                                        ? "text-blue-100"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isOwn && (
                                    <svg
                                      className="w-3 h-3 text-blue-200 transition-all duration-300 group-hover:scale-110"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {isOwn && (
                            <div
                              className={`ml-3 transition-all duration-300 ${
                                showAvatar
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-95 pointer-events-none"
                              }`}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-400/30">
                                <span className="text-xs font-semibold text-white">
                                  {user?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2) || "Me"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>{" "}
              {/* Message Input with modern dashboard styling */}
              <div
                className="bg-card border-t border-border/40 p-6 transition-all duration-300 ease-out"
                style={{ animation: "slideInUp 0.6s ease-out 0.8s both" }}
              >
                <div className="flex items-end space-x-4 group">
                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message Dr. ${selectedDoctor.name}...`}
                      rows={1}
                      className="w-full resize-none border border-border rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 focus-ring shadow-sm"
                      style={{
                        minHeight: "52px",
                        maxHeight: "120px",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 120) + "px";
                      }}
                      onFocus={() => markActivity()}
                    />
                  </div>

                  {/* Modern Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                    className={`px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center font-semibold min-w-[90px] h-[52px] shadow-sm ${
                      messageInput.trim() && !sendingMessage
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Sending</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-0.5" />
                        <span className="text-sm">Send</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Modern status indicators */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="transition-colors duration-300 hover:text-blue-500">
                      Press Enter to send • Shift+Enter for new line
                    </span>
                  </div>

                  {isIntensiveMode && (
                    <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400 font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
                      <span>Real-time active</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No doctor selected - Modern dashboard styling
            <div
              className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-muted/30 transition-all duration-300 ease-out"
              style={{ animation: "fadeIn 0.6s ease-out" }}
            >
              <div
                className="text-center text-muted-foreground max-w-md mx-auto p-8 transition-all duration-300 hover:scale-105"
                style={{ animation: "scaleIn 0.6s ease-out 0.2s both" }}
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                    <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl border-2 border-blue-200 dark:border-blue-700/50 animate-pulse opacity-50"></div>
                </div>

                <div
                  className="space-y-4"
                  style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
                >
                  <h3 className="text-xl font-bold text-foreground">
                    Select a Doctor to Start Messaging
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose a colleague from the sidebar to begin your
                    professional conversation. Collaborate on cases, share
                    insights, or discuss patient care.
                  </p>

                  <div className="flex items-center justify-center space-x-3 mt-6 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500/50"></div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Smart polling enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
