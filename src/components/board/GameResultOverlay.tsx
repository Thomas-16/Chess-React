
import type { GameResult } from '../../types/chess';

interface GameResultOverlayProps {
  result: GameResult;
  onNewGame: () => void;
}

export function GameResultOverlay({ result, onNewGame }: GameResultOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <div
          className="text-3xl font-bold text-center px-6 py-3 rounded-lg"
          style={{
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          {result.displayText}
        </div>
        <button
          onClick={onNewGame}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors pointer-events-auto"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
