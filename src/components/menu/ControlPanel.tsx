
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
    <div
      className="flex flex-col gap-5 p-4 rounded-xl"
      style={{
        backgroundColor: '#13161d',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: stockfishReady ? '#3fb950' : '#d29922' }}
          />
          <span className="text-xs" style={{ color: '#5c6370' }}>
            {stockfishReady ? 'Engine ready' : 'Loading engine'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: connected ? '#3fb950' : '#f85149' }}
          />
          <span className="text-xs" style={{ color: '#5c6370' }}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

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
        className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'rgba(212,168,67,0.1)',
          border: '1px solid rgba(212,168,67,0.22)',
          color: '#d4a843',
        }}
        onMouseEnter={e => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = 'rgba(212,168,67,0.18)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(212,168,67,0.1)';
        }}
      >
        {isPlaying ? 'Resign & New Game' : 'New Game'}
      </button>

      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="w-full py-1.5 rounded text-xs transition-all text-left"
        style={{ color: soundEnabled ? '#5c6370' : '#3a3f4a' }}
      >
        {soundEnabled ? '♪ Sound on' : '♪ Sound off'}
      </button>
    </div>
  );
}
