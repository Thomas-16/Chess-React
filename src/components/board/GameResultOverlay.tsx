
import type { GameResult } from '../../types/chess';

interface GameResultOverlayProps {
  result: GameResult;
  onNewGame: () => void;
}

export function GameResultOverlay({ result, onNewGame }: GameResultOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ backgroundColor: 'rgba(8,12,20,0.82)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="flex flex-col items-center gap-5 px-8 py-6 rounded-2xl"
        style={{
          backgroundColor: '#0e1628',
          border: '1px solid rgba(129,140,248,0.28)',
          boxShadow: '0 0 40px rgba(129,140,248,0.12)',
        }}
      >
        <div
          className="text-2xl font-semibold tracking-wide"
          style={{ color: '#818cf8' }}
        >
          {result.displayText}
        </div>
        <button
          onClick={onNewGame}
          className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: 'rgba(129,140,248,0.12)',
            border: '1px solid rgba(129,140,248,0.28)',
            color: '#818cf8',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.12)'; }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
