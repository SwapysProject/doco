// app/components/chatbot/Chatbot.tsx

'use client';

import { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatIcons } from './icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: Message[] = [
  {
    role: 'assistant',
    content: 'Hello! I am your AI Medical Co-Pilot. How can I assist you?',
  },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleClearMemory = () => {
    setMessages(initialMessages); // Reset to the initial greeting
  };

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      // --- THE CRUCIAL FIX IS HERE ---
      const historyForApi = currentMessages
        .slice(0, -1) // Get all messages except the new one
        // Filter out the initial greeting if it's the very first message in the array
        .filter((msg, index) => !(index === 0 && msg.role === 'assistant'))
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));
      // --------------------------------

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: historyForApi }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Failed to send message:', error.message);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center animate-float hover:bg-primary/90 transition-colors focus-ring"
          aria-label="Open AI Chat"
        >
          <ChatIcons.bot className="h-7 w-7" />
        </button>
      )}
      {isOpen && (
        <ChatWindow
          onClose={() => setIsOpen(false)}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onClearMemory={handleClearMemory}
        />
      )}
    </>
  );
}