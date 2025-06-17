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
    scrollToBottom();
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
        <div className="flex h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading messages...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Doctor List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {" "}
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Doctor Messages
              </h1>

              {/* WebSocket Connection Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>{isConnected ? "Smart Polling" : "Offline"}</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />{" "}
            </div>
          </div>
          {/* Doctor List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>No doctors found</p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => {
                const conversation = conversations.find(
                  (c) => c.doctorId === doctor._id
                );
                return (
                  <div
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`group relative p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 ${
                      selectedDoctor?._id === doctor._id
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-r-4 border-r-blue-500 shadow-lg"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                            selectedDoctor?._id === doctor._id
                              ? "bg-blue-600 shadow-lg scale-110"
                              : "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 group-hover:shadow-md group-hover:scale-105"
                          }`}
                        >
                          <Stethoscope
                            className={`h-6 w-6 transition-colors duration-200 ${
                              selectedDoctor?._id === doctor._id
                                ? "text-white"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        </div>

                        {/* Activity indicator */}
                        {conversation && conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
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
                              className={`text-sm font-semibold truncate transition-colors duration-200 ${
                                selectedDoctor?._id === doctor._id
                                  ? "text-blue-900 dark:text-blue-100"
                                  : "text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-100"
                              }`}
                            >
                              Dr. {doctor.name}
                            </p>
                            <p
                              className={`text-xs truncate transition-colors duration-200 ${
                                selectedDoctor?._id === doctor._id
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {doctor.specialization}
                            </p>
                          </div>

                          <div className="flex flex-col items-end space-y-1">
                            {conversation?.lastMessageTime && (
                              <span
                                className={`text-xs transition-colors duration-200 ${
                                  selectedDoctor?._id === doctor._id
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 group-hover:text-blue-500"
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
                              className={`text-xs truncate transition-colors duration-200 ${
                                selectedDoctor?._id === doctor._id
                                  ? "text-blue-800 dark:text-blue-200"
                                  : conversation.unreadCount > 0
                                    ? "text-gray-900 dark:text-gray-100 font-medium"
                                    : "text-gray-600 dark:text-gray-400"
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
                    {/* Hover effect indicator */}
                    <div
                      className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 transition-opacity duration-200 ${
                        selectedDoctor?._id === doctor._id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50"
                      }`}
                    ></div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedDoctor ? (
            <>
              {" "}
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Stethoscope className="h-7 w-7 text-white" />
                      </div>
                      {/* Activity pulse ring */}
                      {isIntensiveMode && (
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Dr. {selectedDoctor.name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {selectedDoctor.specialization}
                        </p>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              isConnected
                                ? isIntensiveMode
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-blue-500"
                                : "bg-red-500"
                            }`}
                            title={`Polling: ${
                              isIntensiveMode ? "Intensive (1s)" : "Normal (5s)"
                            } - ${isConnected ? "Connected" : "Disconnected"}`}
                          ></div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {isIntensiveMode ? "Real-time active" : "Connected"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat actions */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-6 shadow-lg mb-4">
                      <MessageSquare className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No messages yet
                    </h3>
                    <p className="text-center max-w-sm">
                      Start a conversation with Dr. {selectedDoctor.name}! Share
                      medical insights, discuss cases, or collaborate on patient
                      care.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.senderId !== selectedDoctor._id;
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1]?.senderId !== message.senderId;
                    const nextMessage = messages[index + 1];
                    const isLastInGroup =
                      !nextMessage || nextMessage.senderId !== message.senderId;

                    return (
                      <div
                        key={message._id}
                        className={`flex items-end ${isOwn ? "justify-end" : "justify-start"} ${
                          isLastInGroup ? "mb-4" : "mb-1"
                        }`}
                      >
                        {!isOwn && (
                          <div
                            className={`mr-2 ${showAvatar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {selectedDoctor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={`max-w-xs lg:max-w-md`}>
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                              isOwn
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                            style={{
                              borderBottomRightRadius:
                                isOwn && isLastInGroup ? "6px" : "18px",
                              borderBottomLeftRadius:
                                !isOwn && isLastInGroup ? "6px" : "18px",
                            }}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.message}
                            </p>
                            {isLastInGroup && (
                              <div
                                className={`flex items-center mt-2 space-x-1 ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <span
                                  className={`text-xs ${
                                    isOwn
                                      ? "text-blue-100"
                                      : "text-gray-500 dark:text-gray-400"
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
                                    className="w-3 h-3 text-blue-200"
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
                            className={`ml-2 ${showAvatar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-xs font-medium text-white">
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
                  })
                )}
                <div ref={messagesEndRef} />
              </div>{" "}
              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                {" "}
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message Dr. ${selectedDoctor.name}...`}
                      rows={1}
                      className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      style={{
                        minHeight: "50px",
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

                  {/* Separate Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                    className={`px-4 py-3 mb-2  rounded-lg transition-all duration-200 flex items-center justify-center font-medium min-w-[80px] h-[50px] ${
                      messageInput.trim() && !sendingMessage
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2 " />
                        <span className="text-sm">Send</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  {/* <span>Press Enter to send, Shift+Enter for new line</span> */}
                  {isIntensiveMode && (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Real-time active</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No doctor selected
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
              <div className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-blue-200 dark:border-blue-700 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Select a Doctor to Start Messaging
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Choose a colleague from the sidebar to begin your professional
                  conversation. Collaborate on cases, share insights, or discuss
                  patient care.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Smart polling enabled</span>
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
