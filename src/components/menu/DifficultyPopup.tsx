import type { DifficultyLevel } from '../../types/chess';

interface DifficultyPopupProps {
  open: boolean;
  difficulty: DifficultyLevel;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onStart: () => void;
  stockfishReady: boolean;
}

const DIFFICULTIES: { level: DifficultyLevel; description: string }[] = [
  { level: 'Easy',   description: 'Beginner friendly' },
  { level: 'Medium', description: 'Casual challenge' },
  { level: 'Hard',   description: 'Competitive play' },
  { level: 'Expert', description: 'Maximum strength' },
];

export function DifficultyPopup({ open, difficulty, onDifficultyChange, onStart, stockfishReady }: DifficultyPopupProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          width: 360,
          backgroundColor: '#FFFFFF',
          border: '1px solid #C8D8EB',
          borderTop: '3px solid #232F3B',
          boxShadow: '0 8px 32px rgba(35,47,59,0.18)',
          padding: '28px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Title */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#232F3B',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            New Game
          </div>
          <div style={{ fontSize: 12, color: '#7A9AB5', letterSpacing: '0.02em' }}>
            Select difficulty
          </div>
        </div>

        {/* Difficulty options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DIFFICULTIES.map(({ level, description }) => {
            const isSelected = difficulty === level;
            return (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 14px',
                  border: '1px solid',
                  borderColor: isSelected ? '#232F3B' : '#C8D8EB',
                  borderLeft: `3px solid ${isSelected ? '#232F3B' : 'transparent'}`,
                  backgroundColor: isSelected ? '#232F3B' : '#FAFCFE',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.1s ease',
                  borderRadius: 2,
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#EEF3F8';
                    e.currentTarget.style.borderColor = '#A8BDD4';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#FAFCFE';
                    e.currentTarget.style.borderColor = '#C8D8EB';
                  }
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isSelected ? '#FFFFFF' : '#232F3B',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {level}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: isSelected ? 'rgba(255,255,255,0.65)' : '#7A9AB5',
                    marginTop: 2,
                  }}
                >
                  {description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!stockfishReady}
          style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'Outfit, sans-serif',
            padding: '10px 28px',
            border: '1px solid #232F3B',
            backgroundColor: '#232F3B',
            color: '#FFFFFF',
            cursor: stockfishReady ? 'pointer' : 'not-allowed',
            opacity: stockfishReady ? 1 : 0.5,
            transition: 'all 0.12s ease',
            letterSpacing: '-0.01em',
            borderRadius: 2,
            alignSelf: 'stretch',
          }}
          onMouseEnter={e => {
            if (stockfishReady) {
              e.currentTarget.style.backgroundColor = '#1A2530';
            }
          }}
          onMouseLeave={e => {
            if (stockfishReady) {
              e.currentTarget.style.backgroundColor = '#232F3B';
            }
          }}
        >
          {stockfishReady ? 'Start Game' : 'Loading engine…'}
        </button>
      </div>
    </div>
  );
}
