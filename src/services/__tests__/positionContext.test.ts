import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { buildPositionContext } from '../positionContext';

describe('buildPositionContext', () => {
  it('returns null when not playing', () => {
    const chess = new Chess();
    expect(buildPositionContext(chess, 'white', false)).toBeNull();
  });

  it('returns context for starting position with human as white', () => {
    const chess = new Chess();
    const ctx = buildPositionContext(chess, 'white', true);

    expect(ctx).not.toBeNull();
    // AI is black, so playerColor is Black
    expect(ctx!.playerColor).toBe('Black');
    expect(ctx!.moveNumber).toBe(1);
    expect(ctx!.turnToMove).toBe('White');
    expect(ctx!.isInCheck).toBe(false);
    // Both sides start with equal material
    expect(ctx!.playerMaterialCentipawns).toBe(ctx!.opponentMaterialCentipawns);
    // Starting material: 8P(800) + 2N(640) + 2B(660) + 2R(1000) + Q(900) = 4000
    expect(ctx!.playerMaterialCentipawns).toBe(4000);
    expect(ctx!.recentMoves).toEqual([]);
    expect(ctx!.gamePhase).toBe('Opening');
    expect(ctx!.legalMoveCount).toBeNull(); // 20 legal moves > 5
  });

  it('returns context for starting position with human as black', () => {
    const chess = new Chess();
    const ctx = buildPositionContext(chess, 'black', true);

    expect(ctx).not.toBeNull();
    // AI is white, so playerColor is White
    expect(ctx!.playerColor).toBe('White');
  });

  it('tracks recent moves', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    chess.move('Nf3');
    const ctx = buildPositionContext(chess, 'white', true);

    expect(ctx!.recentMoves).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('only returns last 5 recent moves', () => {
    const chess = new Chess();
    chess.move('e4'); chess.move('e5');
    chess.move('Nf3'); chess.move('Nc6');
    chess.move('Bb5'); chess.move('a6');
    const ctx = buildPositionContext(chess, 'white', true);

    expect(ctx!.recentMoves).toHaveLength(5);
    expect(ctx!.recentMoves[0]).toBe('e5');
  });

  it('detects game phase based on move number', () => {
    const chess = new Chess();
    // Opening: move 1-9
    expect(buildPositionContext(chess, 'white', true)!.gamePhase).toBe('Opening');

    // Build a position at move 10+ by loading a FEN
    const midgameFen = 'r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 10';
    const chess2 = new Chess(midgameFen);
    expect(buildPositionContext(chess2, 'white', true)!.gamePhase).toBe('Middlegame');

    // Endgame: move 40+
    const endgameFen = '8/8/4k3/8/8/4K3/4P3/8 w - - 0 40';
    const chess3 = new Chess(endgameFen);
    expect(buildPositionContext(chess3, 'white', true)!.gamePhase).toBe('Endgame');
  });

  it('detects check', () => {
    // Position where black king is in check
    const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 2');
    chess.move('Qh4');
    // Now white is in check
    const ctx = buildPositionContext(chess, 'black', true);
    expect(ctx!.isInCheck).toBe(true);
  });

  it('tracks material after captures', () => {
    const chess = new Chess();
    chess.move('e4'); chess.move('d5');
    chess.move('exd5'); // White captures black pawn
    const ctx = buildPositionContext(chess, 'white', true);

    // AI (black) lost a pawn: 4000 - 100 = 3900
    expect(ctx!.playerMaterialCentipawns).toBe(3900);
    // Human (white) gained a pawn through capture but pawns just disappear
    // White still has 4000 centipawns in pieces
    expect(ctx!.opponentMaterialCentipawns).toBe(4000);
  });

  it('returns legalMoveCount when fewer than 5 legal moves', () => {
    // Position where one side has very few legal moves
    const chess = new Chess('7k/8/6K1/8/8/8/8/6R1 b - - 0 1');
    const ctx = buildPositionContext(chess, 'white', true);
    // Black king has very few moves
    expect(ctx!.legalMoveCount).not.toBeNull();
    expect(ctx!.legalMoveCount).toBeLessThan(5);
  });
});
