
import type { ChatMessage } from '../../types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.speaker === 'user';
  const displayText = message.isTyping && message.visibleChars !== undefined
    ? message.text.slice(0, message.visibleChars)
    : message.text;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-600 text-gray-100 rounded-bl-sm'
        }`}
      >
        {displayText}
        {message.isTyping && (
          <span className="inline-block ml-0.5 animate-pulse">|</span>
        )}
      </div>
    </div>
  );
}
