import type { Chess } from 'chess.js';
import type { GameResult } from '../types/chess';

export function buildPgn(chess: Chess, result: GameResult, humanColor: 'white' | 'black'): string {
  const playerName = 'Human';
  const aiName = 'Stockfish';
  const white = humanColor === 'white' ? playerName : aiName;
  const black = humanColor === 'black' ? playerName : aiName;

  const resultStr = result.winner === 'white'
    ? '1-0'
    : result.winner === 'black'
    ? '0-1'
    : '1/2-1/2';

  const pgn = chess.pgn({
    maxWidth: 72,
  });

  // Prepend headers
  const headers = [
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${resultStr}"]`,
    `[Termination "${result.reason}"]`,
  ].join('\n');

  return `${headers}\n\n${pgn}`;
}

export function getResultString(result: GameResult): string {
  if (result.winner === 'white') return '1-0';
  if (result.winner === 'black') return '0-1';
  return '1/2-1/2';
}
