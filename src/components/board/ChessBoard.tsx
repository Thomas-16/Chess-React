import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import type { PlayerColor } from '../../types/chess';

interface ChessBoardProps {
  fen: string;
  humanColor: PlayerColor;
  onPieceDrop: (from: Square, to: Square, piece: string) => boolean;
  onSquareClick: (square: Square) => void;
  onPieceDragBegin: (piece: string, square: Square) => void;
  onPieceDragEnd: (piece: string, square: Square) => void;
  onRightClick: (square: Square) => void;
  onPromotionSelect: (piece?: string, fromSquare?: Square, toSquare?: Square) => boolean;
  pendingPromotion: { from: Square; to: Square } | null;
  customSquareStyles: Record<string, React.CSSProperties>;
  isInteractive: boolean;
}

export function ChessBoard({
  fen,
  humanColor,
  onPieceDrop,
  onSquareClick,
  onPieceDragBegin,
  onPieceDragEnd,
  onRightClick,
  onPromotionSelect,
  pendingPromotion,
  customSquareStyles,
  isInteractive,
}: ChessBoardProps) {
  return (
    <Chessboard
      position={fen}
      boardOrientation={humanColor}
      onPieceDrop={(from, to, piece) => onPieceDrop(from as Square, to as Square, piece)}
      onSquareClick={(square) => onSquareClick(square as Square)}
      onPieceDragBegin={(piece, square) => onPieceDragBegin(piece, square as Square)}
      onPieceDragEnd={(piece, square) => onPieceDragEnd(piece, square as Square)}
      onSquareRightClick={(square) => onRightClick(square as Square)}
      onPromotionPieceSelect={(piece, fromSquare, toSquare) =>
        onPromotionSelect(piece, fromSquare as Square | undefined, toSquare as Square | undefined)
      }
      showPromotionDialog={pendingPromotion !== null}
      promotionToSquare={pendingPromotion?.to ?? null}
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
