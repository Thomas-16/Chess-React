

interface PlayerBarProps {
  name: string;
  isTop?: boolean;
}

export function PlayerBar({ name, isTop = false }: PlayerBarProps) {
  return (
    <div className={`flex items-center px-3 py-2 rounded-lg bg-gray-800 ${isTop ? 'mb-1' : 'mt-1'}`}>
      <span className="text-white font-medium text-sm">{name}</span>
    </div>
  );
}
