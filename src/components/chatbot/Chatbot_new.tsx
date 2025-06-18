// app/components/chatbot/Chatbot.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { ChatIcons } from "./icons";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  totalPatients: number;
  recentPrescriptions: number;
  upcomingAppointments: number;
  doctorName: string;
  specialization?: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial context when chat opens
  useEffect(() => {
    if (isOpen && !chatContext) {
      loadInitialContext();
    }
  }, [isOpen, chatContext]);

  const loadInitialContext = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "GET",
        credentials: "include", // Use cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatContext({
          totalPatients: data.summary.totalPatients,
          recentPrescriptions: data.summary.recentPrescriptions,
          upcomingAppointments: data.summary.upcomingAppointments,
          doctorName: data.doctorInfo.name,
          specialization: data.doctorInfo.specialization,
        });

        // Set welcome message with context
        const welcomeMessage: Message = {
          role: "assistant",
          content: `Hello Dr. ${data.doctorInfo.name}! I'm your AI Medical Co-Pilot. 

📊 **Your Dashboard Summary:**
- **${data.summary.totalPatients}** Total Patients
- **${data.summary.recentPrescriptions}** Recent Prescriptions  
- **${data.summary.upcomingAppointments}** Upcoming Appointments
- **${data.summary.criticalPatients}** Critical Cases

I have access to all your patient data, prescriptions, and appointments. How can I assist you today?`,
        };
        setMessages([welcomeMessage]);
      } else if (response.status === 401) {
        setError("Please log in to access the AI Medical Co-Pilot");
      }
    } catch (error) {
      console.error("Error loading chat context:", error);
      setError("Failed to initialize AI Medical Co-Pilot");
    }
  };

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      const userMessage: Message = { role: "user", content: message };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Prepare conversation history for API
        const history = messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          credentials: "include", // Use cookies for authentication
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            history,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update context if provided
        if (data.context) {
          setChatContext(data.context);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error. Please try again.";
        setError(errorMessage);

        const errorResponse: Message = {
          role: "assistant",
          content: `⚠️ **Error:** ${errorMessage}\n\nPlease try again or contact support if the issue persists.`,
        };
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMemory = useCallback(() => {
    setMessages([]);
    setChatContext(null);
    setError(null);
    // Reload initial context
    if (isOpen) {
      loadInitialContext();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null); // Clear any previous errors when opening
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-5 right-5 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
        title="AI Medical Co-Pilot"
      >
        {isOpen ? (
          <ChatIcons.close className="h-6 w-6" />
        ) : (
          <ChatIcons.bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
        )}

        {/* Notification badge for context */}
        {chatContext && !isOpen && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={() => setIsOpen(false)}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onClearMemory={clearMemory}
        />
      )}

      {/* Error Toast */}
      {error && isOpen && (
        <div className="fixed bottom-24 right-5 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-2">
            <ChatIcons.warning className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:bg-destructive/20 rounded-full p-1"
            >
              <ChatIcons.close className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
