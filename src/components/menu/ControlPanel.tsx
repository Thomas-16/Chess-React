
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
      className="flex flex-col gap-5 p-5 rounded-xl"
      style={{
        backgroundColor: '#0e1628',
        border: '1px solid rgba(139,148,255,0.12)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 22, color: '#818cf8' }}>♟</span>
        <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#818cf8' }}>Chess</span>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(139,148,255,0.08)' }} />

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: stockfishReady ? '#34d399' : '#fbbf24' }}
          />
          <span className="text-xs" style={{ color: '#8892a4' }}>
            {stockfishReady ? 'Engine ready' : 'Loading engine'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: connected ? '#34d399' : '#f87171' }}
          />
          <span className="text-xs" style={{ color: '#8892a4' }}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(139,148,255,0.08)' }} />

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
          backgroundColor: 'rgba(129,140,248,0.12)',
          border: '1px solid rgba(129,140,248,0.28)',
          color: '#818cf8',
        }}
        onMouseEnter={e => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.22)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(129,140,248,0.12)';
        }}
      >
        {isPlaying ? 'Resign & New Game' : 'New Game'}
      </button>

      <div style={{ height: '1px', backgroundColor: 'rgba(139,148,255,0.08)' }} />

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="w-full py-1.5 rounded text-xs transition-all text-left"
        style={{ color: soundEnabled ? '#8892a4' : '#3d4f6a' }}
      >
        {soundEnabled ? '♪ Sound on' : '♪ Sound off'}
      </button>
    </div>
  );
}
