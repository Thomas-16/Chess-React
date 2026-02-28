import React from 'react';

interface GameLayoutProps {
  menu: React.ReactNode;
  board: React.ReactNode;
  chat: React.ReactNode;
}

export function GameLayout({ menu, board, chat }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex items-start gap-4 w-full max-w-7xl">
        {/* Left: Control panel */}
        <div className="flex-shrink-0 w-48">
          {menu}
        </div>

        {/* Center: Board */}
        <div className="flex-shrink-0">
          {board}
        </div>

        {/* Right: Chat */}
        <div className="flex-shrink-0 self-stretch">
          {chat}
        </div>
      </div>
    </div>
  );
}
