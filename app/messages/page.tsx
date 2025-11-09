// app/messages/page.tsx - FULLY FIXED WITH PROPER UNREAD HANDLING
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
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  messages: Message[];
  unreadCount: number;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

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

  // NEW: Mark messages as read when conversation is opened
  const markMessagesAsRead = async (conversation: Conversation) => {
    if (!currentUser) return;

    try {
      // Find messages that are unread AND not sent by current user
      const unreadMessages = conversation.messages.filter(
        message => !message.read && message.senderId !== currentUser.id
      );

      if (unreadMessages.length > 0) {
        console.log(`📖 Marking ${unreadMessages.length} messages as read`);
        
        // Update messages as read in the database
        const response = await fetch(`/api/messages/${conversation._id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            readerId: currentUser.id
          }),
        });

        if (response.ok) {
          const updatedConversation = await response.json();
          setSelectedConversation(updatedConversation);
          
          // Update conversations list
          setConversations(prev => 
            prev.map(conv => 
              conv._id === updatedConversation._id 
                ? updatedConversation 
                : conv
            )
          );
          
          console.log('✅ Messages marked as read');
        }
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Helper function to get other person's name
  const getOtherPersonName = (conversation: Conversation) => {
    if (!currentUser) return 'Unknown User';
    
    return currentUser.id === conversation.buyerId 
      ? conversation.sellerName 
      : conversation.buyerName;
  };

  // Helper function to check if message is from current user
  const isMessageFromCurrentUser = (message: Message) => {
    return currentUser && message.senderId === currentUser.id;
  };

  // Check if conversation has unread messages
  const hasUnreadMessages = (conversation: Conversation) => {
    if (!currentUser) return false;
    
    return conversation.messages.some(message => 
      !message.read && message.senderId !== currentUser.id
    );
  };

  // Count unread messages in a conversation
  const getUnreadCount = (conversation: Conversation) => {
    if (!currentUser) return 0;
    
    return conversation.messages.filter(message => 
      !message.read && message.senderId !== currentUser.id
    ).length;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
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
              conversations.map((conversation) => {
                const unreadCount = getUnreadCount(conversation);
                const hasUnread = hasUnreadMessages(conversation);
                
                return (
                  <div
                    key={conversation._id}
                    className={`p-4 border-b cursor-pointer hover:bg-accent ${
                      selectedConversation?._id === conversation._id ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      markMessagesAsRead(conversation); // ← MARK AS READ WHEN OPENED!
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      {/* BOLD TITLE for unread conversations */}
                      <h3 className={`text-sm ${hasUnread ? 'font-bold text-foreground' : 'font-semibold'}`}>
                        {conversation.itemTitle}
                      </h3>
                      {/* Unread badge - ONLY shows if there are unread messages */}
                      {unreadCount > 0 && (
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* BOLD "with [person]" for unread conversations */}
                    <p className={`text-sm mb-1 ${hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      with {getOtherPersonName(conversation)}
                    </p>
                    
                    {/* BOLD last message for unread conversations */}
                    <p className={`text-sm truncate ${hasUnread ? 'font-medium' : ''}`}>
                      {conversation.messages[conversation.messages.length - 1]?.text}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
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
                  with {getOtherPersonName(selectedConversation)}
                </p>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`rounded-lg p-3 max-w-[70%] ${
                        isMessageFromCurrentUser(message) 
                          ? 'bg-green-600 text-white' 
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {isMessageFromCurrentUser(message) ? 'You' : message.senderName}
                          </p>
                          {!message.read && !isMessageFromCurrentUser(message) && (
                            <span className="text-xs bg-blue-500 text-white px-1 rounded">unread</span>
                          )}
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          isMessageFromCurrentUser(message) 
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
                    disabled={!newMessage.trim() || !currentUser}
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