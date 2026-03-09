import React from 'react';

interface GameLayoutProps {
  board: React.ReactNode;
  chat: React.ReactNode;
}

export function GameLayout({ board, chat }: GameLayoutProps) {
  return (
    <div
      className="flex justify-center"
      style={{ background: '#E4ECF5', padding: '36px 32px', alignItems: 'flex-start', height: '100dvh', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        <div style={{ flexShrink: 0 }}>
          {board}
        </div>
        <div style={{ width: 400, flexShrink: 0 }}>
          {chat}
        </div>
      </div>
    </div>
  );
}
