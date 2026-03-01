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
    <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px', paddingRight: 16 }}>
      {messages.length === 0 && (
        <p
          style={{
            fontSize: 13,
            color: '#3D5C6E',
            marginTop: 20,
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          Ask about the position
        </p>
      )}
      {messages.map(msg => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isWaiting && (
        <div className="flex justify-start mb-3">
          <span style={{ fontSize: 13, color: '#3D5C6E' }}>
            Thinking<span className="animate-pulse">...</span>
          </span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
