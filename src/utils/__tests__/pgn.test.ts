import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { buildPgn, getResultString } from '../pgn';
import type { GameResult } from '../../types/chess';

describe('getResultString', () => {
  it('returns "1-0" for white win', () => {
    const result: GameResult = { winner: 'white', reason: 'checkmate', displayText: '' };
    expect(getResultString(result)).toBe('1-0');
  });

  it('returns "0-1" for black win', () => {
    const result: GameResult = { winner: 'black', reason: 'checkmate', displayText: '' };
    expect(getResultString(result)).toBe('0-1');
  });

  it('returns "1/2-1/2" for draw', () => {
    const result: GameResult = { winner: 'draw', reason: 'stalemate', displayText: '' };
    expect(getResultString(result)).toBe('1/2-1/2');
  });
});

describe('buildPgn', () => {
  it('includes correct headers for human as white', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    const result: GameResult = { winner: 'white', reason: 'checkmate', displayText: '' };
    const pgn = buildPgn(chess, result, 'white');

    expect(pgn).toContain('[White "Human"]');
    expect(pgn).toContain('[Black "AI"]');
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toContain('[Termination "checkmate"]');
  });

  it('includes correct headers for human as black', () => {
    const chess = new Chess();
    chess.move('e4');
    const result: GameResult = { winner: 'black', reason: 'timeout', displayText: '' };
    const pgn = buildPgn(chess, result, 'black');

    expect(pgn).toContain('[White "AI"]');
    expect(pgn).toContain('[Black "Human"]');
    expect(pgn).toContain('[Result "0-1"]');
    expect(pgn).toContain('[Termination "timeout"]');
  });

  it('includes move text in PGN body', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    chess.move('Nf3');
    const result: GameResult = { winner: 'draw', reason: 'stalemate', displayText: '' };
    const pgn = buildPgn(chess, result, 'white');

    expect(pgn).toContain('1. e4 e5');
    expect(pgn).toContain('Nf3');
  });
});
