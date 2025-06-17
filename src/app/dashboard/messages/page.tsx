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

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);  const [sendingMessage, setSendingMessage] = useState(false);
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
  const { 
    isConnected, 
    isIntensiveMode, 
    markActivity,
    getPollingStatus 
  } = useSmartPolling(
    pollForMessages,
    !!selectedDoctor && !!user,
    {
      intensiveInterval: 1000,  // Poll every 1 second when chat is active
      normalInterval: 5000,     // Poll every 5 seconds when idle
      idleTimeout: 30000,       // Switch to normal mode after 30 seconds of inactivity
      maxRetries: 3
    }
  );

  // Log polling status changes
  useEffect(() => {
    const status = getPollingStatus();
    console.log(`📡 Polling Status: ${status.mode} mode (${status.interval}ms) - Connected: ${status.connected}`);
  }, [isIntensiveMode, isConnected, getPollingStatus]);
  // Simple functions for conversation management
  const joinConversation = (doctorId: string) => {
    console.log("Joining conversation with:", doctorId);
    markActivity(); // Start intensive polling when joining a conversation
  };

  const leaveConversation = () => {
    console.log("Leaving conversation");
    // Activity will naturally timeout to normal polling
  };
  // Fetch all doctors for messaging
  const fetchDoctors = async () => {
    try {
      console.log("Fetching doctors for messaging...");
      const response = await fetch("/api/doctors/list");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Doctors API response:", data);

        if (data.success) {
          console.log("Setting doctors:", data.doctors);
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
      console.log(
        "🚀 Sending message to:",
        selectedDoctor.name,
        "(",
        selectedDoctor._id,
        ")"
      );

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
          console.log("✅ Message sent successfully, intensive polling started");
          setMessageInput("");
          // Refresh messages immediately
          await fetchMessages(selectedDoctor._id);
          // Refresh conversations to update unread counts
          await fetchConversations();
        }
      } else {
        console.error("❌ Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (doctorId: string) => {
    try {
      await fetch("/api/doctor-messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationWith: doctorId,
        }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleDoctorSelect = async (doctor: Doctor) => {
    if (!user) return;

    // Leave previous conversation room if any
    if (selectedDoctor) {
      leaveConversation();
    }    setSelectedDoctor(doctor);

    // Join new conversation room
    joinConversation(doctor._id);

    await fetchMessages(doctor._id);
    await markAsRead(doctor._id);
    await fetchConversations(); // Refresh to update unread count
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

    console.log(
      `Doctor: ${doctor.name}, Specialization: ${doctor.specialization}, Search: "${searchTerm}", MatchesName: ${matchesName}, MatchesSpecialization: ${matchesSpecialization}`
    );

    return matchesName || matchesSpecialization;
  });

  console.log(
    `Total doctors: ${doctors.length}, Filtered doctors: ${filteredDoctors.length}, Search term: "${searchTerm}"`
  );
  console.log(
    "All doctors:",
    doctors.map((d) => ({ name: d.name, specialization: d.specialization }))
  );

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
              />
            </div>
          </div>
          {/* Debug Section - Remove this in production */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Debug Info:
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Total doctors: {doctors.length} | Filtered:{" "}
              {filteredDoctors.length} | Search: &quot;{searchTerm}&quot;
            </p>
            {doctors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Sample doctors:
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400">
                  {doctors.slice(0, 3).map((d) => (
                    <li key={d._id}>
                      • {d.name} ({d.specialization})
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedDoctor?._id === doctor._id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {doctor.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Dr. {doctor.name}
                          </p>{" "}
                          {conversation && conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {doctor.specialization}
                        </p>
                        {conversation && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
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
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {selectedDoctor.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dr. {selectedDoctor.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedDoctor.specialization} •{" "}
                        {selectedDoctor.isOnline ? "Online" : "Offline"}
                      </p>
                      {/* Polling Status Indicator */}
                      <div className="flex items-center space-x-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isConnected
                              ? isIntensiveMode
                                ? "bg-green-500 animate-pulse"
                                : "bg-blue-500"
                              : "bg-red-500"
                          }`}
                          title={`Polling: ${isIntensiveMode ? "Intensive (1s)" : "Normal (5s)"} - ${isConnected ? "Connected" : "Disconnected"}`}
                        ></div>
                        <span className="text-xs text-gray-400">
                          {isIntensiveMode ? "🔥" : "💤"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId !== selectedDoctor._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? "bg-blue-600 text-white"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-3">                  <textarea
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message Dr. ${selectedDoctor.name}...`}
                    rows={1}
                    className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No doctor selected
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Select a doctor to start messaging
                </h3>
                <p>
                  Choose a colleague from the sidebar to begin your conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
