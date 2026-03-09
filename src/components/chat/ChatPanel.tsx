import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '../../types/chat';

interface ChatPanelProps {
  messages: ChatMessage[];
  isWaiting: boolean;
  onSend: (text: string) => void;
  hasGame: boolean;
  connected: boolean;
}

export function ChatPanel({ messages, isWaiting, onSend, hasGame, connected }: ChatPanelProps) {
  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: '#232F3B',
        border: '1px solid #1C2730',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#1C2730',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#5A8598',
          }}
        >
          Chat With AI
        </span>
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: connected ? '#22C55E' : '#EF4444',
            }}
          />
          <span style={{ fontSize: 11, color: '#3D5C6E' }}>
            {connected ? 'live' : 'offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isWaiting={isWaiting} />

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isWaiting || !connected} hasGame={hasGame} />
    </div>
  );
}
