

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

  const barHeight = Math.max(4, Math.round(volume * 20));

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? 'Stop recording' : 'Start recording'}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all flex-shrink-0 ${
        isRecording
          ? 'bg-red-600 hover:bg-red-500 animate-pulse'
          : 'bg-gray-600 hover:bg-gray-500'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isRecording ? (
        <>
          {/* Volume bars */}
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 bg-white rounded-full transition-all"
                style={{ height: `${barHeight * (i === 2 ? 1 : 0.6)}px` }}
              />
            ))}
          </div>
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
            {formatDuration(duration)}
          </span>
        </>
      ) : (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      )}
    </button>
  );
}
