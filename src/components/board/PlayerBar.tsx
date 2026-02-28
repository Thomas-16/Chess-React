
interface PlayerBarProps {
  name: string;
  isTop?: boolean;
}

export function PlayerBar({ name, isTop = false }: PlayerBarProps) {
  return (
    <div className={`flex items-center px-1 ${isTop ? 'mb-2' : 'mt-2'}`}>
      <span className="text-sm font-medium" style={{ color: '#7d8a9a' }}>{name}</span>
    </div>
  );
}
