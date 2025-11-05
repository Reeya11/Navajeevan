// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, User } from "lucide-react";

interface Message {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  itemId: string;
  itemTitle: string;
  sellerName: string;
  buyerName: string;
  messages: Message[];
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch specific conversation when selected
  useEffect(() => {
    if (selectedConversation?._id) {
      const fetchConversation = async () => {
        try {
          const response = await fetch(`/api/messages/${selectedConversation._id}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedConversation(data);
          }
        } catch (error) {
          console.error('Failed to fetch conversation:', error);
        }
      };

      fetchConversation();
    }
  }, [selectedConversation?._id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: 'current-user-id', // TODO: Replace with actual user ID
          senderName: 'Current User',  // TODO: Replace with actual user name
          text: newMessage
        }),
      });

      if (response.ok) {
        const updatedConversation = await response.json();
        setSelectedConversation(updatedConversation);
        setNewMessage('');
        
        // Update conversations list with latest message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === updatedConversation._id 
              ? updatedConversation 
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Communicate with buyers and sellers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent ${
                    selectedConversation?._id === conversation._id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{conversation.itemTitle}</h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    with {conversation.sellerName === 'Current User' ? conversation.buyerName : conversation.sellerName}
                  </p>
                  <p className="text-sm truncate">
                    {conversation.messages[conversation.messages.length - 1]?.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 border rounded-lg flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b bg-muted/50">
                <h2 className="font-semibold">{selectedConversation.itemTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  with {selectedConversation.sellerName === 'Current User' ? selectedConversation.buyerName : selectedConversation.sellerName}
                </p>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.senderName === 'Current User' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`rounded-lg p-3 max-w-[70%] ${
                        message.senderName === 'Current User' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderName === 'Current User' 
                            ? 'text-white/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}