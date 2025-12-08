import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onBookAppointment: () => void;
  showBookingButton: boolean;
}

export function ChatArea({ messages, isLoading, onBookAppointment, showBookingButton }: ChatAreaProps) {
  const lastMessage = messages[messages.length - 1];
  const shouldShowBookingButton = showBookingButton && lastMessage?.sender === 'ai' && lastMessage.intent === 'SALES';
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={endRef} />
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl shadow-sm">
              <div className="flex space-x-1 items-center">
                <span className="sr-only">AI is typing</span>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.12s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.24s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {shouldShowBookingButton && (
        <div className="p-4 bg-white/80 backdrop-blur border-t border-gray-200">
          <button
            onClick={onBookAppointment}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 shadow"
          >
            <span>📅</span>
            <span>Book Appointment</span>
          </button>
        </div>
      )}
    </div>
  );
}
