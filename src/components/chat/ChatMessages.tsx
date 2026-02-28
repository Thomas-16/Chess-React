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
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {messages.length === 0 && (
        <p className="text-gray-500 text-sm text-center mt-8">
          Start a new game and chat with the AI!
        </p>
      )}
      {messages.map(msg => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isWaiting && (
        <div className="flex justify-start mb-2">
          <div className="bg-gray-600 text-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
