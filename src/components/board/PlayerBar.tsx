
interface PlayerBarProps {
  name: string;
  isTop?: boolean;
}

export function PlayerBar({ name, isTop = false }: PlayerBarProps) {
  const isYou = name === 'You';
  const initial = name.charAt(0).toUpperCase();
  const avatarStyle = isYou
    ? { backgroundColor: 'rgba(129,140,248,0.18)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }
    : { backgroundColor: 'rgba(139,148,255,0.06)', color: '#5c6e8a', border: '1px solid rgba(139,148,255,0.12)' };

  return (
    <div className={`flex items-center gap-2 px-1 ${isTop ? 'mb-2.5' : 'mt-2.5'}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
        style={avatarStyle}
      >
        {initial}
      </div>
      <span className="text-sm font-medium" style={{ color: isYou ? '#c8d0e0' : '#5c6e8a' }}>{name}</span>
    </div>
  );
}
