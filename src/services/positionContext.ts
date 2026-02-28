import type { Chess } from 'chess.js';
import type { ChessPositionContext } from '../types/chat';
import type { PlayerColor } from '../types/chess';
import { PIECE_VALUES } from '../constants/game';

export function buildPositionContext(
  chess: Chess,
  humanColor: PlayerColor,
  isPlaying: boolean,
): ChessPositionContext | null {
  if (!isPlaying) return null;

  try {
    const board = chess.board();
    const moveNumber = chess.moveNumber();
    const turnToMove = chess.turn() === 'w' ? 'White' : 'Black';
    const isInCheck = chess.isCheck();
    const history = chess.history();
    const recentMoves = history.slice(-5);

    // AI color is opposite of human
    const aiColor = humanColor === 'white' ? 'black' : 'white';
    const aiColorChar = aiColor === 'white' ? 'w' : 'b';
    const humanColorChar = humanColor === 'white' ? 'w' : 'b';

    let aiMaterial = 0;
    let humanMaterial = 0;
    const aiPieceMap: Record<string, number> = {};
    const humanPieceMap: Record<string, number> = {};

    for (const row of board) {
      for (const square of row) {
        if (!square) continue;
        const value = PIECE_VALUES[square.type] ?? 0;
        if (square.color === aiColorChar) {
          aiMaterial += value;
          const key = square.type.toUpperCase();
          if (square.type !== 'k') aiPieceMap[key] = (aiPieceMap[key] ?? 0) + 1;
        } else if (square.color === humanColorChar) {
          humanMaterial += value;
          const key = square.type.toUpperCase();
          if (square.type !== 'k') humanPieceMap[key] = (humanPieceMap[key] ?? 0) + 1;
        }
      }
    }

    const toPieceList = (map: Record<string, number>) =>
      Object.entries(map).map(([k, v]) => `${v}${k}`);

    const moves = chess.moves();
    const legalMoveCount = moves.length < 5 ? moves.length : null;

    let gamePhase = 'Opening';
    if (moveNumber >= 40) gamePhase = 'Endgame';
    else if (moveNumber >= 10) gamePhase = 'Middlegame';

    return {
      playerColor: aiColor === 'white' ? 'White' : 'Black',
      moveNumber,
      turnToMove,
      playerMaterialCentipawns: aiMaterial,
      opponentMaterialCentipawns: humanMaterial,
      playerPieces: toPieceList(aiPieceMap),
      opponentPieces: toPieceList(humanPieceMap),
      recentMoves,
      gamePhase,
      isInCheck,
      legalMoveCount,
    };
  } catch {
    return null;
  }
}
