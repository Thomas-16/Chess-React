export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  visibleChars?: number;
}

export interface ChessPositionContext {
  playerColor: string;
  moveNumber: number;
  turnToMove: string;
  playerMaterialCentipawns: number;
  opponentMaterialCentipawns: number;
  playerPieces: string[];
  opponentPieces: string[];
  recentMoves: string[];
  gamePhase: string;
  isInCheck: boolean;
  legalMoveCount: number | null;
}
