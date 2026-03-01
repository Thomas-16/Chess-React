import React from 'react';

interface GameLayoutProps {
  menu: React.ReactNode;
  board: React.ReactNode;
  chat: React.ReactNode;
}

export function GameLayout({ menu, board, chat }: GameLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.06) 0%, #080c14 60%), #080c14',
      }}
    >
      <div className="flex items-start" style={{ gap: 24 }}>
        <div className="flex-shrink-0" style={{ width: 260 }}>
          {menu}
        </div>
        <div className="flex-shrink-0">
          {board}
        </div>
        <div className="flex-shrink-0 self-stretch" style={{ width: 440 }}>
          {chat}
        </div>
      </div>
    </div>
  );
}
