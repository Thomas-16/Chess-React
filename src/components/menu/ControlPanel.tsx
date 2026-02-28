
import { DifficultySelector } from './DifficultySelector';
import type { DifficultyLevel } from '../../types/chess';

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
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-xl h-full">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-white">Chess</h1>
        <p className="text-gray-400 text-xs mt-1">Human vs AI</p>
      </div>

      {/* Status indicators */}
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stockfishReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-gray-300">{stockfishReady ? 'Engine ready' : 'Loading engine...'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          <span className="text-gray-300">{connected ? 'Backend connected' : 'Connecting...'}</span>
        </div>
      </div>

      <hr className="border-gray-700" />

      {/* Difficulty */}
      <DifficultySelector
        selected={difficulty}
        onChange={onDifficultyChange}
        disabled={isPlaying}
      />

      {/* New Game */}
      <button
        onClick={onNewGame}
        disabled={!stockfishReady}
        className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        New Game
      </button>

      <hr className="border-gray-700" />

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${soundEnabled
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
          }`}
      >
        {soundEnabled ? 'Sound: On' : 'Sound: Off'}
      </button>
    </div>
  );
}
