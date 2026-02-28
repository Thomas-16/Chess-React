import React from 'react';

interface GameLayoutProps {
  menu: React.ReactNode;
  board: React.ReactNode;
  chat: React.ReactNode;
}

export function GameLayout({ menu, board, chat }: GameLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0" style={{ width: 192 }}>
          {menu}
        </div>
        <div className="flex-shrink-0">
          {board}
        </div>
        <div className="flex-shrink-0 self-stretch" style={{ width: 360 }}>
          {chat}
        </div>
      </div>
    </div>
  );
}
