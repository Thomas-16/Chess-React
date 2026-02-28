
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
      <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#4a5568' }}>
        Difficulty
      </span>
      <div className="grid grid-cols-2 gap-1">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            disabled={disabled}
            style={selected === d ? {
              backgroundColor: 'rgba(212,168,67,0.12)',
              border: '1px solid rgba(212,168,67,0.35)',
              color: '#d4a843',
            } : {
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#5c6370',
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
