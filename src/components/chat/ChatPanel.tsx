
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
        backgroundColor: '#0e1628',
        border: '1px solid rgba(139,148,255,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          borderBottom: '1px solid rgba(139,148,255,0.08)',
          background: 'linear-gradient(180deg, rgba(129,140,248,0.06) 0%, transparent 100%)',
        }}
      >
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#818cf8' }}>
          Chat With AI
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: connected ? '#34d399' : '#f87171' }}
          />
          <span className="text-xs" style={{ color: '#3d4f6a' }}>
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
