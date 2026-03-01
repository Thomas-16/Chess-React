
import type { ChatMessage } from '../../types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.speaker === 'user';
  const displayText = message.isTyping && message.visibleChars !== undefined
    ? message.text.slice(0, message.visibleChars)
    : message.text;

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div
          className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
          style={{
            backgroundColor: 'rgba(129,140,248,0.12)',
            border: '1px solid rgba(129,140,248,0.22)',
            color: '#a5b4fc',
          }}
        >
          {displayText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div
        className="max-w-[90%] text-sm leading-relaxed pl-3"
        style={{
          borderLeft: '2px solid rgba(129,140,248,0.3)',
          color: '#8892a4',
        }}
      >
        {displayText}
        {message.isTyping && (
          <span className="inline-block ml-0.5 animate-pulse" style={{ color: '#818cf8' }}>▋</span>
        )}
      </div>
    </div>
  );
}
