interface PlayerBarProps {
  name: string;
  isTop?: boolean;
}

export function PlayerBar({ name, isTop = false }: PlayerBarProps) {
  const isYou = name === 'You';

  return (
    <div className={`flex items-center gap-2 ${isTop ? 'mb-2' : 'mt-2'}`}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 3,
          backgroundColor: isYou ? '#232F3B' : '#EEF4FB',
          border: isYou ? 'none' : '1px solid #C8D8EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 600,
          color: isYou ? '#FFFFFF' : '#8BADC4',
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: isYou ? 500 : 400,
          color: isYou ? '#232F3B' : '#7A9AB5',
          letterSpacing: '-0.01em',
        }}
      >
        {name}
      </span>
    </div>
  );
}
