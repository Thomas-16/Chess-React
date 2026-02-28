
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
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#13161d',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#4a5568' }}>
          Chat With AI
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: connected ? '#3fb950' : '#f85149' }}
          />
          <span className="text-xs" style={{ color: '#3a3f4a' }}>
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
