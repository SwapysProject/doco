"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Send, Search, Phone, Video, MoreVertical, User, Stethoscope, Check, CheckCheck } from 'lucide-react';

// Type definitions
interface Contact {
  id: number;
  name: string;
  type: 'doctor' | 'patient';
  specialty?: string;
  age?: number;
  avatar?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: number;
  senderId: number | string;
  senderName: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface MessagesState {
  [contactId: number]: Message[];
}

const MessagesPage: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [messages, setMessages] = useState<MessagesState>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for contacts
  const [contacts] = useState<Contact[]>([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      type: 'doctor',
      specialty: 'Cardiologist',
      avatar: null,
      lastMessage: 'The patient\'s ECG results look concerning',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      name: 'John Smith',
      type: 'patient',
      age: 45,
      avatar: null,
      lastMessage: 'Thank you for the prescription',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      name: 'Dr. Michael Chen',
      type: 'doctor',
      specialty: 'Neurologist',
      avatar: null,
      lastMessage: 'Can we schedule a consultation?',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: 4,
      name: 'Emily Davis',
      type: 'patient',
      age: 32,
      avatar: null,
      lastMessage: 'My symptoms are getting better',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 5,
      name: 'Dr. Lisa Wang',
      type: 'doctor',
      specialty: 'Pediatrician',
      avatar: null,
      lastMessage: 'The child responded well to treatment',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
      isOnline: false
    }
  ]);

  // Mock messages data
  const [mockMessages] = useState<MessagesState>({
    1: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Dr. Sarah Johnson',
        message: 'Hi! I wanted to discuss the patient case we reviewed earlier.',
        timestamp: '10:30 AM',
        isOwn: false,
        status: 'read'
      },
      {
        id: 2,
        senderId: 'current',
        senderName: 'You',
        message: 'Yes, the ECG results were quite interesting. What\'s your assessment?',
        timestamp: '10:32 AM',
        isOwn: true,
        status: 'read'
      },
      {
        id: 3,
        senderId: 1,
        senderName: 'Dr. Sarah Johnson',
        message: 'The patient\'s ECG results look concerning. I think we should consider immediate intervention.',
        timestamp: '10:35 AM',
        isOwn: false,
        status: 'read'
      }
    ],
    2: [
      {
        id: 1,
        senderId: 2,
        senderName: 'John Smith',
        message: 'Hello Doctor, I have a question about my medication.',
        timestamp: '9:00 AM',
        isOwn: false,
        status: 'read'
      },
      {
        id: 2,
        senderId: 'current',
        senderName: 'You',
        message: 'Hello John! I\'m happy to help. What would you like to know?',
        timestamp: '9:15 AM',
        isOwn: true,
        status: 'read'
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'John Smith',
        message: 'Thank you for the prescription. Should I take it with food?',
        timestamp: '11:00 AM',
        isOwn: false,
        status: 'read'
      }
    ]
  });

  useEffect(() => {
    setMessages(mockMessages);
  }, [mockMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact, messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (): void => {
    if (!messageInput.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now(),
      senderId: 'current',
      senderName: 'You',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: 'sent'
    };

    setMessages((prev: MessagesState) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));

    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getContactIcon = (contact: Contact): JSX.Element => {
    if (contact.type === 'doctor') {
      return <Stethoscope className="w-4 h-4 text-blue-500" />;
    }
    return <User className="w-4 h-4 text-green-500" />;
  };

  const getMessageStatus = (status: Message['status']): JSX.Element | null => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleContactSelect = (contact: Contact): void => {
    setSelectedContact(contact);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessageInput(e.target.value);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact: Contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent ${
                selectedContact?.id === contact.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    {getContactIcon(contact)}
                  </div>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                    <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {contact.type === 'doctor' ? contact.specialty : `Patient, ${contact.age}y`}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">{contact.lastMessage}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    {getContactIcon(selectedContact)}
                  </div>
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-foreground">{selectedContact.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.type === 'doctor' 
                      ? selectedContact.specialty 
                      : `Patient, ${selectedContact.age} years old`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="Start voice call"
                >
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </button>
                <button 
                  type="button"
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="Start video call"
                >
                  <Video className="w-5 h-5 text-muted-foreground" />
                </button>
                <button 
                  type="button"
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(messages[selectedContact.id] || []).map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span className="text-xs">{message.timestamp}</span>
                      {message.isOwn && getMessageStatus(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-medium text-foreground mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;