import type { Message } from '../types';
import { cn } from '../lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSalesIntent = message.intent === 'SALES';
  const isHotLead = message.isHotLead;
  const initials = isUser ? 'U' : 'AI';

  return (
    <div className={cn('flex items-end gap-2 mb-3', isUser ? 'justify-end' : 'justify-start')}> 
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      )}
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm',
        isUser ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border border-gray-200',
        isHotLead && 'ring-2 ring-yellow-400 shadow-md'
      )}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={cn('mt-1 flex items-center gap-2')}> 
          {isSalesIntent && !isUser && (
            <span className="inline-flex items-center text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
              💰 Sales
            </span>
          )}
          {isHotLead && !isUser && (
            <span className="inline-flex items-center text-[11px] font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
              🔥 Hot Lead
            </span>
          )}
          <span className={cn('text-[11px]', isUser ? 'text-blue-100' : 'text-gray-500')}>{message.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
      )}
    </div>
  );
}
