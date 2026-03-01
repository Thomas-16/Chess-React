import type { GameResult } from '../../types/chess';

interface GameResultOverlayProps {
  result: GameResult;
  onReturnToIdle: () => void;
}

export function GameResultOverlay({ result, onReturnToIdle }: GameResultOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="flex flex-col items-center gap-4 px-10 py-8"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #C8D8EB',
          borderTop: '3px solid #232F3B',
          boxShadow: '0 4px 20px rgba(35,47,59,0.12)',
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#232F3B',
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          {result.displayText}
        </div>
        {result.reason && (
          <div style={{ fontSize: 13, color: '#7A9AB5', letterSpacing: '-0.01em' }}>
            {result.reason}
          </div>
        )}
        <button
          onClick={onReturnToIdle}
          style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'Outfit, sans-serif',
            padding: '10px 28px',
            border: '1px solid #232F3B',
            backgroundColor: 'transparent',
            color: '#232F3B',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            marginTop: 4,
            letterSpacing: '-0.01em',
            borderRadius: 2,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#232F3B';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#232F3B';
          }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
