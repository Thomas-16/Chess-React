

interface PlayerBarProps {
  name: string;
  timeMs: number;
  isActive: boolean;
  isTop?: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerBar({ name, timeMs, isActive, isTop = false }: PlayerBarProps) {
  const isLow = timeMs < 30000;

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
      isActive ? 'bg-gray-700' : 'bg-gray-800'
    } ${isTop ? 'mb-1' : 'mt-1'}`}>
      <span className="text-white font-medium text-sm">{name}</span>
      <span className={`font-mono font-bold text-lg tabular-nums ${
        isLow ? 'text-red-400' : isActive ? 'text-white' : 'text-gray-400'
      }`}>
        {formatTime(timeMs)}
      </span>
    </div>
  );
}
