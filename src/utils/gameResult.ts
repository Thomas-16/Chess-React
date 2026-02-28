import type { Chess } from 'chess.js';
import type { GameResult } from '../types/chess';

export function getGameResult(chess: Chess): GameResult | null {
  if (!chess.isGameOver()) return null;

  if (chess.isCheckmate()) {
    const loser = chess.turn(); // The player who is in checkmate
    const winner = loser === 'w' ? 'black' : 'white';
    return {
      winner,
      reason: 'checkmate',
      displayText: winner === 'white' ? 'White wins by checkmate!' : 'Black wins by checkmate!',
    };
  }

  if (chess.isStalemate()) {
    return { winner: 'draw', reason: 'stalemate', displayText: 'Draw by stalemate' };
  }

  if (chess.isThreefoldRepetition()) {
    return { winner: 'draw', reason: 'repetition', displayText: 'Draw by threefold repetition' };
  }

  if (chess.isInsufficientMaterial()) {
    return { winner: 'draw', reason: 'insufficient', displayText: 'Draw by insufficient material' };
  }

  if (chess.isDraw()) {
    return { winner: 'draw', reason: 'fifty-move', displayText: 'Draw by fifty-move rule' };
  }

  return null;
}

export function getTimeoutResult(loserColor: 'white' | 'black'): GameResult {
  const winner = loserColor === 'white' ? 'black' : 'white';
  return {
    winner,
    reason: 'timeout',
    displayText: winner === 'white' ? 'White wins on time!' : 'Black wins on time!',
  };
}

export function getGameEndChatPrompt(result: GameResult, humanColor: 'white' | 'black'): string {
  const aiColor = humanColor === 'white' ? 'black' : 'white';

  if (result.winner === 'draw') {
    return 'The game just ended in a draw. React briefly in 1-2 sentences.';
  }

  if (result.winner === aiColor) {
    return 'You just checkmated the user and won the game. React to your victory in 1-2 brief sentences. Be gracious but confident.';
  }

  return 'You just got checkmated by the user and lost the game. React to your loss in 1-2 brief sentences. Be a good sport about it.';
}
