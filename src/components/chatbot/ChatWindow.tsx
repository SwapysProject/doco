// app/components/chatbot/ChatWindow.tsx

"use client";

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// 1. We've already imported these, but just confirming they are needed.
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatIcons } from "./icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearMemory: () => void;
}

// Voice assistant interface
interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function ChatWindow({
  onClose,
  messages,
  isLoading,
  onSendMessage,
  onClearMemory,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Create a ref that will point to our input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice assistant state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
  });

  // Voice recognition refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice assistant functions
  const handleSend = useCallback((message?: string) => {
    const textToSend = message || input;
    if (textToSend.trim()) {
      onSendMessage(textToSend);
      setInput("");
    }
  }, [input, onSendMessage]);

  const speakMessage = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Remove markdown formatting for better speech
      const cleanText = text.replace(/[*_`#\[\]()]/g, '').replace(/\n/g, ' ');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };
      
      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isSupported) {
      recognitionRef.current.start();
    }
  }, [voiceState.isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setVoiceState(prev => ({ ...prev, isSupported: true }));
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setVoiceState(prev => ({ ...prev, isListening: true }));
        };
        
        recognition.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }));
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Auto-send the voice message
          setTimeout(() => {
            handleSend(transcript);
          }, 500);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setVoiceState(prev => ({ ...prev, isListening: false }));
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [handleSend]);

  // Text-to-speech for AI responses
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        speakMessage(lastMessage.content);
      }
    }
  }, [messages, isLoading, speakMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setInput("");
    }
  };

  return (
    <div
      className="fixed bottom-20 right-5 h-[75vh] max-h-[700px] z-50 animate-slideInUp animate-duration-300 sm:right-5 sm:bottom-20 max-sm:right-2 max-sm:bottom-16 max-sm:left-2"
      style={{
        width: "450px",
        maxWidth: "calc(100vw - 1rem)",
        minWidth: "380px",
      }}
    >
      <div className="flex flex-col h-full bg-card border border-border rounded-lg shadow-xl">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full">
              <ChatIcons.bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="font-semibold text-card-foreground">
              AI Medical Co-Pilot
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={onClearMemory}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted focus-ring"
              title="Clear conversation history"
            >
              <ChatIcons.clear className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted focus-ring"
            >
              <ChatIcons.close className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {!messages.some(msg => msg.role === 'user') && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground text-sm mb-4">
                <div className="bg-primary/10 rounded-lg p-4 mb-4">
                  <div className="text-primary font-semibold mb-1">
                    🩺 AI Medical Co-Pilot
                  </div>
                  <div className="text-xs">
                    Get instant insights about your patients, appointments, and
                    prescriptions
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Try these quick actions:
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() =>
                    onSendMessage(
                      "Show me all my patients in a table with their current status"
                    )
                  }
                  className="group p-3 text-xs text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 rounded-lg transition-all duration-200 border border-blue-200/50 dark:border-blue-800/50"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
                      📋
                    </div>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        Patient Overview
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        View all patients with status
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() =>
                    onSendMessage(
                      "List today's appointments with patient details"
                    )
                  }
                  className="group p-3 text-xs text-left bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/30 dark:to-green-900/30 dark:hover:from-green-900/50 dark:hover:to-green-800/50 rounded-lg transition-all duration-200 border border-green-200/50 dark:border-green-800/50"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
                      📅
                    </div>
                    <div>
                      <div className="font-medium text-green-900 dark:text-green-100">
                        Today&apos;s Schedule
                      </div>
                      <div className="text-green-700 dark:text-green-300">
                        View appointments for today
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() =>
                    onSendMessage(
                      "Show recent prescriptions with patient names and medications"
                    )
                  }
                  className="group p-3 text-xs text-left bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 rounded-lg transition-all duration-200 border border-purple-200/50 dark:border-purple-800/50"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
                      💊
                    </div>
                    <div>
                      <div className="font-medium text-purple-900 dark:text-purple-100">
                        Recent Prescriptions
                      </div>
                      <div className="text-purple-700 dark:text-purple-300">
                        View latest medication orders
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() =>
                    onSendMessage(
                      "Show critical patients that need immediate attention"
                    )
                  }
                  className="group p-3 text-xs text-left bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-950/30 dark:to-red-900/30 dark:hover:from-red-900/50 dark:hover:to-red-800/50 rounded-lg transition-all duration-200 border border-red-200/50 dark:border-red-800/50"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
                      🚨
                    </div>
                    <div>
                      <div className="font-medium text-red-900 dark:text-red-100">
                        Critical Alerts
                      </div>
                      <div className="text-red-700 dark:text-red-300">
                        Check urgent patient cases
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border border-border shadow-sm">
                            <table className="min-w-full border-collapse bg-card">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-primary/5 border-b border-border">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="border-r border-border p-3 text-left font-semibold text-xs text-primary uppercase tracking-wide">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-r border-b border-border/50 p-3 text-xs text-card-foreground">
                            {children}
                          </td>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-2 my-3 pl-4">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-2 my-3 pl-4 list-decimal">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm leading-relaxed flex items-start">
                            <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{children}</span>
                          </li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mt-5 mb-3 text-primary border-b border-primary/20 pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-md font-semibold mt-4 mb-2 text-primary flex items-center">
                            <span className="inline-block w-1 h-4 bg-primary mr-2 rounded"></span>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-semibold mt-3 mb-2 text-muted-foreground uppercase tracking-wide">
                            {children}
                          </h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-primary">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-muted-foreground">
                            {children}
                          </em>
                        ),
                        p: ({ children }) => (
                          <p className="my-2 leading-relaxed text-sm text-card-foreground">
                            {children}
                          </p>
                        ),
                        code: ({ children, className }) => (
                          <code
                            className={`px-2 py-1 rounded-md text-xs font-mono bg-primary/10 text-primary border border-primary/20 ${className || ""}`}
                          >
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto my-3 border border-border">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 my-3 text-sm italic text-muted-foreground bg-primary/5 py-2 rounded-r-md">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="my-4 border-border" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-secondary text-secondary-foreground flex items-center gap-1">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-muted/20">
          <form onSubmit={handleSendMessage} className="relative">
            {/* 4. Attach the ref to the input element */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about patients, medications, symptoms..."
              className="w-full pr-24 py-3 pl-4 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 text-sm placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            
            {/* Voice Controls */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {voiceState.isSupported && (
                <>
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={voiceState.isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={`p-2 rounded-lg transition-all duration-200 focus-ring ${
                      voiceState.isListening 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={voiceState.isListening ? "Stop listening" : "Start voice input"}
                  >
                    {voiceState.isListening ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h4v12H6zm8-6h4v12h-4z"/>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Speaker Button */}
                  <button
                    type="button"
                    onClick={voiceState.isSpeaking ? stopSpeaking : () => {}}
                    disabled={isLoading || !voiceState.isSpeaking}
                    className={`p-2 rounded-lg transition-all duration-200 focus-ring ${
                      voiceState.isSpeaking 
                        ? "bg-orange-500 text-white" 
                        : "bg-gray-400 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={voiceState.isSpeaking ? "Stop speaking" : "AI voice output"}
                  >
                    {voiceState.isSpeaking ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.3"/>
                      </svg>
                    )}
                  </button>
                </>
              )}
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:bg-primary/50 disabled:cursor-not-allowed focus-ring hover:bg-primary/90 transition-colors"
              >
                <ChatIcons.send className="h-4 w-4" />
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>💡 Try asking about specific patients or conditions</span>
              {voiceState.isSupported && (
                <span className="text-blue-500">🎤 Voice enabled</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {voiceState.isListening && (
                <span className="text-red-500 animate-pulse">● Listening...</span>
              )}
              {voiceState.isSpeaking && (
                <span className="text-orange-500 animate-pulse">🔊 Speaking...</span>
              )}
              {!voiceState.isListening && !voiceState.isSpeaking && (
                <>
                  <span className="animate-pulse">●</span>
                  <span>AI Ready</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}