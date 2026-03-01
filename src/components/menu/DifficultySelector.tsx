import type { DifficultyLevel } from '../../types/chess';

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard', 'Expert'];

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (d: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ selected, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#BDBDBD',
          marginBottom: 1,
        }}
      >
        Difficulty
      </div>
      <div className="flex flex-col gap-0.5">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            disabled={disabled}
            style={{
              fontSize: 13,
              fontWeight: selected === d ? 500 : 400,
              fontFamily: 'Outfit, sans-serif',
              padding: '7px 10px',
              border: 'none',
              backgroundColor: selected === d ? '#0A0A0A' : 'transparent',
              color: selected === d ? '#FFFFFF' : '#6B6B6B',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
              textAlign: 'left',
              transition: 'all 0.1s ease',
              width: '100%',
              letterSpacing: '-0.01em',
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
