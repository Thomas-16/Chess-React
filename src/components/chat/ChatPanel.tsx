
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
        width: '450px',
        backgroundColor: 'rgba(20, 22, 30, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <h2 className="text-white font-semibold text-sm">AI Commentary</h2>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isWaiting={isWaiting} />

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isWaiting || !connected} hasGame={hasGame} />
    </div>
  );
}
