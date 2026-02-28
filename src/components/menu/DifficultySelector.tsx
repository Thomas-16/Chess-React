
import type { DifficultyLevel } from '../../types/chess';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Expert'];

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (d: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ selected, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Difficulty</span>
      <div className="grid grid-cols-2 gap-1">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            disabled={disabled}
            className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
              selected === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
