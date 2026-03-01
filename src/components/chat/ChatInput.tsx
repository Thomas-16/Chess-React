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
      className="flex items-center gap-2"
      style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#1C2730',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={hasGame ? 'Talk about the position...' : 'Start a game to chat'}
        disabled={isDisabled}
        style={{
          flex: 1,
          fontFamily: 'Outfit, sans-serif',
          fontSize: 13,
          padding: '7px 10px',
          backgroundColor: '#2C3D4A',
          border: '1px solid rgba(255,255,255,0.07)',
          color: '#CDDEE8',
          outline: 'none',
          minWidth: 0,
          transition: 'border-color 0.15s ease',
          opacity: isDisabled ? 0.4 : 1,
          letterSpacing: '-0.01em',
          borderRadius: 2,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(90,133,152,0.6)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
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
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          padding: '7px 14px',
          border: '1px solid rgba(90,133,152,0.55)',
          backgroundColor: 'transparent',
          color: '#5A8598',
          cursor: isDisabled || !text.trim() ? 'not-allowed' : 'pointer',
          opacity: isDisabled || !text.trim() ? 0.3 : 1,
          flexShrink: 0,
          transition: 'all 0.12s ease',
          letterSpacing: '-0.01em',
          borderRadius: 2,
        }}
        onMouseEnter={e => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = '#5A8598';
            e.currentTarget.style.color = '#FFFFFF';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#5A8598';
        }}
      >
        Send
      </button>
    </div>
  );
}
