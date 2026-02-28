
import type { GameResult } from '../../types/chess';

interface GameResultOverlayProps {
  result: GameResult;
  onNewGame: () => void;
}

export function GameResultOverlay({ result, onNewGame }: GameResultOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ backgroundColor: 'rgba(10,12,18,0.75)', backdropFilter: 'blur(2px)' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="text-2xl font-semibold tracking-wide"
          style={{ color: '#d4a843' }}
        >
          {result.displayText}
        </div>
        <button
          onClick={onNewGame}
          className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: 'rgba(212,168,67,0.1)',
            border: '1px solid rgba(212,168,67,0.3)',
            color: '#d4a843',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(212,168,67,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(212,168,67,0.1)'; }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
