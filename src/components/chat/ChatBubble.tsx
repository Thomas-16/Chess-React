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
          style={{
            maxWidth: '82%',
            padding: '8px 12px',
            backgroundColor: '#2C3D4A',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 14,
            lineHeight: 1.55,
            color: '#CDDEE8',
            letterSpacing: '-0.01em',
            borderRadius: 2,
          }}
        >
          {displayText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div
        style={{
          maxWidth: '92%',
          fontSize: 14,
          lineHeight: 1.65,
          color: '#7FA8BC',
          borderLeft: '2px solid rgba(255,255,255,0.08)',
          paddingLeft: 12,
          letterSpacing: '-0.01em',
        }}
      >
        {displayText}
        {message.isTyping && (
          <span className="inline-block ml-0.5 animate-pulse" style={{ color: '#5A8598' }}>▋</span>
        )}
      </div>
    </div>
  );
}
