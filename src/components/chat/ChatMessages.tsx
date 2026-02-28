import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import { ChatBubble } from './ChatBubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isWaiting: boolean;
}

export function ChatMessages({ messages, isWaiting }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {messages.length === 0 && (
        <p className="text-xs text-center mt-10" style={{ color: '#3a3f4a' }}>
          Ask the AI about the position
        </p>
      )}
      {messages.map(msg => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isWaiting && (
        <div className="flex justify-start mb-3">
          <div className="pl-3" style={{ borderLeft: '2px solid rgba(212,168,67,0.25)' }}>
            <span className="inline-flex gap-1 items-center">
              <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: '#d4a843', animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: '#d4a843', animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: '#d4a843', animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
