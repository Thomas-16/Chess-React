import type { DifficultyLevel } from '../../types/chess';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Expert'];

interface ControlPanelProps {
  difficulty: DifficultyLevel;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onNewGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  connected: boolean;
  stockfishReady: boolean;
  isPlaying: boolean;
}

export function ControlPanel({
  difficulty,
  onDifficultyChange,
  onNewGame,
  soundEnabled,
  onToggleSound,
  connected,
  stockfishReady,
  isPlaying,
}: ControlPanelProps) {
  return (
    <div
      className="flex items-center"
      style={{
        background: '#EEF4FB',
        border: '1px solid #C8D8EB',
        borderTop: 'none',
        padding: '10px 16px',
        gap: 16,
      }}
    >
      {/* Status indicators */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: stockfishReady ? '#16A34A' : '#D97706',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: '#5A7A96', whiteSpace: 'nowrap' }}>
            {stockfishReady ? 'Engine ready' : 'Loading'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: connected ? '#16A34A' : '#DC2626',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: '#5A7A96', whiteSpace: 'nowrap' }}>
            {connected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 16, backgroundColor: '#C8D8EB', flexShrink: 0 }} />

      {/* Difficulty pills */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onDifficultyChange(d)}
            disabled={isPlaying}
            style={{
              fontSize: 12,
              fontWeight: difficulty === d ? 500 : 400,
              fontFamily: 'Outfit, sans-serif',
              padding: '4px 10px',
              border: difficulty === d ? '1px solid #232F3B' : '1px solid transparent',
              backgroundColor: difficulty === d ? '#232F3B' : 'transparent',
              color: difficulty === d ? '#FFFFFF' : '#5A7A96',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              opacity: isPlaying ? 0.5 : 1,
              transition: 'all 0.1s ease',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* New Game */}
      <button
        onClick={onNewGame}
        disabled={!stockfishReady}
        style={{
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Outfit, sans-serif',
          padding: '5px 14px',
          border: '1px solid #232F3B',
          backgroundColor: 'transparent',
          color: '#232F3B',
          cursor: stockfishReady ? 'pointer' : 'not-allowed',
          opacity: stockfishReady ? 1 : 0.3,
          transition: 'all 0.12s ease',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          borderRadius: 2,
        }}
        onMouseEnter={e => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = '#232F3B';
            e.currentTarget.style.color = '#FFFFFF';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#232F3B';
        }}
      >
        {isPlaying ? 'Resign & New' : 'New Game'}
      </button>

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        style={{
          fontSize: 14,
          fontFamily: 'Outfit, sans-serif',
          color: soundEnabled ? '#232F3B' : '#8BADC4',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          transition: 'color 0.12s ease',
          lineHeight: 1,
        }}
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '♪' : '♩'}
      </button>
    </div>
  );
}
