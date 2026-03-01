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
      animationDuration={180}
      arePiecesDraggable={isInteractive}
      customBoardStyle={{
        borderRadius: '2px',
        boxShadow: '0 1px 12px rgba(0,0,0,0.1)',
      }}
      customDarkSquareStyle={{ backgroundColor: '#B58863' }}
      customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
    />
  );
}
