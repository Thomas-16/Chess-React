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
    <div
      className="flex items-center gap-2 px-3 py-3"
      style={{ borderTop: '1px solid rgba(139,148,255,0.08)' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={hasGame ? 'Ask about the position...' : 'Start a game to chat'}
        disabled={isDisabled}
        className="flex-1 text-sm px-3 py-2 rounded-lg outline-none min-w-0 transition-all"
        style={{
          backgroundColor: 'rgba(139,148,255,0.05)',
          border: '1px solid rgba(139,148,255,0.10)',
          color: '#e2e8f0',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(139,148,255,0.10)'; }}
      />
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
        className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'rgba(129,140,248,0.12)',
          border: '1px solid rgba(129,140,248,0.28)',
          color: '#818cf8',
        }}
        onMouseEnter={e => {
          if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.22)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.12)';
        }}
      >
        Send
      </button>
    </div>
  );
}
