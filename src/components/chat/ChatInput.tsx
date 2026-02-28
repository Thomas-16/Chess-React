import React, { useState, useRef, useCallback } from 'react';
import { VoiceButton } from './VoiceButton';
import { useVoiceInput } from '../../hooks/useVoiceInput';

const MAX_CHARS = 200;

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  hasGame: boolean;
}

export function ChatInput({ onSend, disabled, hasGame }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isRecording, volume, duration, startRecording, stopRecording } = useVoiceInput(
    import.meta.env.VITE_GROQ_API_KEY as string | undefined,
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceStop = async () => {
    const transcribed = await stopRecording();
    if (transcribed) {
      setText(transcribed);
      inputRef.current?.focus();
    }
  };

  const isDisabled = disabled || !hasGame;

  return (
    <div className="flex items-center gap-2 p-3 border-t border-gray-700">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={hasGame ? 'Chat with AI...' : 'Start a game to chat'}
        disabled={isDisabled}
        className="flex-1 bg-gray-700 text-white placeholder-gray-500 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 min-w-0"
      />
      <span className="text-gray-600 text-xs flex-shrink-0">{text.length}/{MAX_CHARS}</span>
      <VoiceButton
        isRecording={isRecording}
        volume={volume}
        duration={duration}
        onStart={startRecording}
        onStop={handleVoiceStop}
        disabled={isDisabled}
      />
      <button
        onClick={handleSend}
        disabled={isDisabled || !text.trim()}
        className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        Send
      </button>
    </div>
  );
}
