
import type { DifficultyLevel } from '../../types/chess';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Expert'];

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (d: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ selected, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#3d4f6a' }}>
        Difficulty
      </span>
      <div className="grid grid-cols-2 gap-1">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            disabled={disabled}
            style={selected === d ? {
              backgroundColor: 'rgba(129,140,248,0.14)',
              border: '1px solid rgba(129,140,248,0.35)',
              color: '#818cf8',
            } : {
              backgroundColor: 'rgba(139,148,255,0.04)',
              border: '1px solid rgba(139,148,255,0.10)',
              color: '#8892a4',
            }}
            className="px-2 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
