import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { getGameResult, getTimeoutResult, getGameEndChatPrompt } from '../gameResult';

describe('getGameResult', () => {
  it('returns null when game is not over', () => {
    const chess = new Chess();
    expect(getGameResult(chess)).toBeNull();
  });

  it('detects checkmate - white wins (scholar\'s mate)', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    chess.move('Qh5');
    chess.move('Nc6');
    chess.move('Bc4');
    chess.move('Nf6');
    chess.move('Qxf7');
    const result = getGameResult(chess);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('white');
    expect(result!.reason).toBe('checkmate');
    expect(result!.displayText).toContain('White wins');
  });

  it('detects checkmate - black wins (fool\'s mate)', () => {
    const chess = new Chess();
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    chess.move('Qh4');
    const result = getGameResult(chess);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('black');
    expect(result!.reason).toBe('checkmate');
    expect(result!.displayText).toContain('Black wins');
  });

  it('detects stalemate', () => {
    // Known stalemate position
    const chess = new Chess('k7/8/1K6/8/8/8/8/1Q6 b - - 0 1');
    // Black king has no legal moves but is not in check = stalemate
    // Actually let's use a more reliable stalemate position
    const chess2 = new Chess('k7/8/2K5/8/8/8/8/8 b - - 0 1');
    // That's not stalemate. Let me use a known one:
    const chess3 = new Chess('5k2/5P2/5K2/8/8/8/8/8 b - - 0 1');
    const result = getGameResult(chess3);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('draw');
    expect(result!.reason).toBe('stalemate');
  });

  it('detects insufficient material (K vs K)', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/K7 w - - 0 1');
    const result = getGameResult(chess);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('draw');
    expect(result!.reason).toBe('insufficient');
  });

  it('returns null for position with sufficient material', () => {
    const chess = new Chess();
    expect(getGameResult(chess)).toBeNull();
  });
});

describe('getTimeoutResult', () => {
  it('returns black wins when white loses on time', () => {
    const result = getTimeoutResult('white');
    expect(result.winner).toBe('black');
    expect(result.reason).toBe('timeout');
    expect(result.displayText).toContain('Black wins');
  });

  it('returns white wins when black loses on time', () => {
    const result = getTimeoutResult('black');
    expect(result.winner).toBe('white');
    expect(result.reason).toBe('timeout');
    expect(result.displayText).toContain('White wins');
  });
});

describe('getGameEndChatPrompt', () => {
  it('returns draw prompt for draw result', () => {
    const result = { winner: 'draw' as const, reason: 'stalemate', displayText: 'Draw' };
    const prompt = getGameEndChatPrompt(result, 'white');
    expect(prompt).toContain('draw');
  });

  it('returns victory prompt when AI wins', () => {
    const result = { winner: 'black' as const, reason: 'checkmate', displayText: 'Black wins' };
    const prompt = getGameEndChatPrompt(result, 'white');
    expect(prompt).toContain('victory');
  });

  it('returns loss prompt when AI loses', () => {
    const result = { winner: 'white' as const, reason: 'checkmate', displayText: 'White wins' };
    const prompt = getGameEndChatPrompt(result, 'white');
    expect(prompt).toContain('loss');
  });
});
