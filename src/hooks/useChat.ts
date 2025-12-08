import { useState, useCallback } from 'react';
import type { ChatState, Message, User } from '../types';
import { chatApi } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const initialUsers: User[] = [
  { id: '1', name: 'Customer A' },
  { id: '2', name: 'Customer B' },
  { id: '3', name: 'Customer C' },
];

const initialMessages: Record<string, Message[]> = {
  '1': [
    {
      id: uuidv4(),
      text: 'Hello! How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ],
  '2': [
    {
      id: uuidv4(),
      text: 'Welcome! What brings you here today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ],
  '3': [
    {
      id: uuidv4(),
      text: 'Hi there! How can I assist you?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ],
};

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    users: initialUsers,
    currentUserId: initialUsers[0].id,
    messages: initialMessages,
    isLoading: false,
  });

  const sendMessage = useCallback(async (text: string) => {
    if (!chatState.currentUserId) return;

    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [chatState.currentUserId!]: [
          ...prev.messages[chatState.currentUserId!],
          userMessage,
        ],
      },
      isLoading: true,
    }));

    try {
      const response = await chatApi.sendMessage(text);
      
      const aiMessage: Message = {
        id: uuidv4(),
        text: response.reply,
        sender: 'ai',
        timestamp: new Date(),
        intent: response.intent,
        isHotLead: text.toLowerCase().includes('pay now') || text.toLowerCase().includes('buy now'),
      };

      setChatState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatState.currentUserId!]: [
            ...prev.messages[chatState.currentUserId!],
            aiMessage,
          ],
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  }, [chatState.currentUserId]);

  const bookAppointment = useCallback(async () => {
    if (!chatState.currentUserId) return;

    const currentUser = chatState.users.find(u => u.id === chatState.currentUserId);
    
    try {
      const success = await chatApi.bookAppointment(currentUser?.name);
      
      if (success) {
        const confirmationMessage: Message = {
          id: uuidv4(),
          text: 'Booking Confirmed – A confirmation email has been sent.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            [chatState.currentUserId!]: [
              ...prev.messages[chatState.currentUserId!],
              confirmationMessage,
            ],
          },
        }));
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  }, [chatState.currentUserId, chatState.users]);

  const switchUser = useCallback((userId: string) => {
    setChatState(prev => ({ ...prev, currentUserId: userId }));
  }, []);

  const getCurrentMessages = () => {
    return chatState.currentUserId ? chatState.messages[chatState.currentUserId] || [] : [];
  };

  const getCurrentUser = () => {
    return chatState.currentUserId ? chatState.users.find(u => u.id === chatState.currentUserId) : null;
  };

  return {
    users: chatState.users,
    currentUser: getCurrentUser(),
    messages: getCurrentMessages(),
    isLoading: chatState.isLoading,
    sendMessage,
    bookAppointment,
    switchUser,
  };
}