import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import type { PlayerColor } from '../../types/chess';

interface ChessBoardProps {
  fen: string;
  humanColor: PlayerColor;
  onPieceDrop: (from: Square, to: Square, piece: string) => boolean;
  onSquareClick: (square: Square) => void;
  customSquareStyles: Record<string, React.CSSProperties>;
  isInteractive: boolean;
}

export function ChessBoard({
  fen,
  humanColor,
  onPieceDrop,
  onSquareClick,
  customSquareStyles,
  isInteractive,
}: ChessBoardProps) {
  return (
    <Chessboard
      position={fen}
      boardOrientation={humanColor}
      onPieceDrop={(from, to, piece) => onPieceDrop(from as Square, to as Square, piece)}
      onSquareClick={(square) => onSquareClick(square as Square)}
      customSquareStyles={customSquareStyles}
      animationDuration={200}
      arePiecesDraggable={isInteractive}
      customBoardStyle={{
        borderRadius: '6px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,148,255,0.08)',
      }}
      customDarkSquareStyle={{ backgroundColor: '#7a4f3a' }}
      customLightSquareStyle={{ backgroundColor: '#d4c5a9' }}
    />
  );
}
