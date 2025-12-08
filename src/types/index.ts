// Types for the chat application
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  intent?: 'SALES' | 'SUPPORT';
  isHotLead?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatState {
  users: User[];
  currentUserId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
}

export interface IntentResponse {
  reply: string;
  intent: 'SALES' | 'SUPPORT';
  confidence: number;
}