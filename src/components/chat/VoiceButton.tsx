interface VoiceButtonProps {
  isRecording: boolean;
  volume: number;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${s}s`;
}

export function VoiceButton({ isRecording, volume, duration, onStart, onStop, disabled }: VoiceButtonProps) {
  const handleClick = () => {
    if (isRecording) onStop();
    else onStart();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? 'Stop recording' : 'Voice input'}
      style={{
        position: 'relative',
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: isRecording
          ? '1px solid rgba(239,68,68,0.45)'
          : '1px solid rgba(255,255,255,0.08)',
        backgroundColor: isRecording ? 'rgba(239,68,68,0.1)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s ease',
        color: isRecording ? '#EF4444' : '#3D5C6E',
      }}
    >
      {isRecording ? (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
            {[0.6, 1, 0.65].map((scale, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  backgroundColor: '#EF4444',
                  borderRadius: 1,
                  height: Math.max(3, Math.round(volume * 10 * scale)),
                  transition: 'height 0.05s ease',
                }}
              />
            ))}
          </div>
          <span
            style={{
              position: 'absolute',
              top: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              color: '#EF4444',
              whiteSpace: 'nowrap',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {formatDuration(duration)}
          </span>
        </>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      )}
    </button>
  );
}
