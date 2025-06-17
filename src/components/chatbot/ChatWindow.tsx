// app/components/chatbot/ChatWindow.tsx

'use client';

// 1. We've already imported these, but just confirming they are needed.
import { useState, useRef, useEffect } from 'react';
import { ChatIcons } from './icons';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearMemory: () => void;
}

export function ChatWindow({ onClose, messages, isLoading, onSendMessage, onClearMemory }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 2. Create a ref that will point to our input element
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Add a new useEffect hook to handle the input focus
  useEffect(() => {
    // We only want to focus the input when the AI is done responding (i.e., not loading)
    if (!isLoading) {
      // The `?.` is optional chaining, a safety measure in case the ref is not ready
      inputRef.current?.focus();
    }
    // This effect will run every time the `isLoading` state changes.
  }, [isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-20 right-5 w-full max-w-md h-[70vh] max-h-[600px] z-50 animate-slideInUp animate-duration-300">
      <div className="flex flex-col h-full bg-card border border-border rounded-lg shadow-xl">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full"><ChatIcons.bot className="h-5 w-5 text-primary-foreground" /></div>
            <h2 className="font-semibold text-card-foreground">AI Medical Co-Pilot</h2>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={onClearMemory} className="p-1 rounded-full text-muted-foreground hover:bg-muted focus-ring" title="Clear conversation history"><ChatIcons.clear className="h-5 w-5" /></button>
            <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-muted focus-ring"><ChatIcons.close className="h-5 w-5" /></button>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {msg.role === 'assistant' ? (<div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>) : (msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (<div className="flex items-end gap-2 justify-start"><div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-secondary text-secondary-foreground flex items-center gap-1"><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span></div></div>)}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="relative">
            {/* 4. Attach the ref to the input element */}
            <input
              ref={inputRef} 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about symptoms, drugs..." 
              className="w-full pr-12 py-2 pl-3 bg-input border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none" 
              disabled={isLoading} 
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:bg-primary/50 disabled:cursor-not-allowed focus-ring"><ChatIcons.send className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}