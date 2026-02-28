import { useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { DifficultyLevel, PlayerColor, GameResult, GameStatus } from '../types/chess';
import { audioService } from '../services/audioService';
import { getGameResult, getTimeoutResult } from '../utils/gameResult';

interface UseGameProps {
  getBestMove: (fen: string, difficulty: DifficultyLevel, moves: string[]) => Promise<string>;
  stockfishReady: boolean;
  difficulty: DifficultyLevel;
  onGameEnd: (result: GameResult, humanColor: PlayerColor) => void;
  onMoveComplete: (color: PlayerColor) => void;
}

export function useGame({
  getBestMove,
  stockfishReady,
  difficulty,
  onGameEnd,
  onMoveComplete,
}: UseGameProps) {
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(new Chess().fen());
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [humanColor, setHumanColor] = useState<PlayerColor>('white');
  const humanWasWhiteLastRef = useRef(false);
  const uciMovesRef = useRef<string[]>([]);
  const isAiThinkingRef = useRef(false);

  // Square highlights
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [checkedKingSquare, setCheckedKingSquare] = useState<Square | null>(null);

  const getChess = useCallback(() => chessRef.current, []);

  const syncFen = useCallback(() => {
    const chess = chessRef.current;
    setFen(chess.fen());

    // Check highlight
    if (chess.isCheck()) {
      const turn = chess.turn();
      // Find king square
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece?.type === 'k' && piece.color === turn) {
            const file = String.fromCharCode('a'.charCodeAt(0) + c);
            const rank = String(8 - r);
            setCheckedKingSquare((file + rank) as Square);
            return;
          }
        }
      }
    } else {
      setCheckedKingSquare(null);
    }
  }, []);

  const endGame = useCallback((result: GameResult, color: PlayerColor) => {
    setGameStatus('ended');
    setGameResult(result);
    setSelectedSquare(null);
    setLegalMoves([]);
    onGameEnd(result, color);
  }, [onGameEnd]);

  const requestAiMove = useCallback(async (currentHumanColor: PlayerColor) => {
    if (isAiThinkingRef.current || !stockfishReady) return;
    isAiThinkingRef.current = true;

    try {
      const chess = chessRef.current;
      const move = await getBestMove(chess.fen(), difficulty, uciMovesRef.current);

      // Check game hasn't been reset while thinking
      if (chessRef.current !== chess && !chess.fen().includes(chessRef.current.fen().substring(0, 20))) {
        isAiThinkingRef.current = false;
        return;
      }

      const result = chess.move(move);
      if (!result) {
        isAiThinkingRef.current = false;
        return;
      }

      uciMovesRef.current.push(move);

      const isCapture = result.captured !== undefined;
      if (isCapture) audioService.playCapture();
      else audioService.playMove();

      const from = result.from as Square;
      const to = result.to as Square;
      setLastMove({ from, to });
      syncFen();

      const gameRes = getGameResult(chess);
      if (gameRes) {
        endGame(gameRes, currentHumanColor);
      } else {
        // Back to human turn
        onMoveComplete(currentHumanColor);
      }
    } catch (err) {
      console.error('AI move error:', err);
    } finally {
      isAiThinkingRef.current = false;
    }
  }, [getBestMove, difficulty, stockfishReady, syncFen, endGame, onMoveComplete]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string): boolean => {
    const chess = chessRef.current;
    if (gameStatus !== 'playing') return false;

    const turn = chess.turn();
    const isHumanTurn = (turn === 'w' && humanColor === 'white') || (turn === 'b' && humanColor === 'black');
    if (!isHumanTurn || isAiThinkingRef.current) return false;

    // Attempt promotion auto-queen
    const moveObj: { from: Square; to: Square; promotion?: string } = {
      from: sourceSquare,
      to: targetSquare,
    };

    // Auto-promote to queen for pawns
    if (piece.toLowerCase().includes('p')) {
      const targetRank = targetSquare[1];
      if (targetRank === '8' || targetRank === '1') {
        moveObj.promotion = 'q';
      }
    }

    const result = chess.move(moveObj);
    if (!result) return false;

    const uciMove = sourceSquare + targetSquare + (result.promotion ?? '');
    uciMovesRef.current.push(uciMove);

    const isCapture = result.captured !== undefined;
    if (isCapture) audioService.playCapture();
    else audioService.playMove();

    setLastMove({ from: sourceSquare, to: targetSquare });
    setSelectedSquare(null);
    setLegalMoves([]);
    syncFen();

    const gameRes = getGameResult(chess);
    if (gameRes) {
      endGame(gameRes, humanColor);
      return true;
    }

    onMoveComplete(humanColor === 'white' ? 'black' : 'white');

    // Trigger AI move after a short delay for visual feedback
    setTimeout(() => requestAiMove(humanColor), 100);

    return true;
  }, [gameStatus, humanColor, syncFen, endGame, onMoveComplete, requestAiMove]);

  const onSquareClick = useCallback((square: Square) => {
    const chess = chessRef.current;
    if (gameStatus !== 'playing') return;

    const turn = chess.turn();
    const isHumanTurn = (turn === 'w' && humanColor === 'white') || (turn === 'b' && humanColor === 'black');
    if (!isHumanTurn || isAiThinkingRef.current) return;

    const piece = chess.get(square);

    // If a piece is selected and we click a legal target
    if (selectedSquare && legalMoves.includes(square)) {
      onPieceDrop(selectedSquare, square, chess.get(selectedSquare)?.type ?? '');
      return;
    }

    // Select own piece
    if (piece && ((piece.color === 'w' && humanColor === 'white') || (piece.color === 'b' && humanColor === 'black'))) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [gameStatus, humanColor, selectedSquare, legalMoves, onPieceDrop]);

  const startNewGame = useCallback(() => {
    const newHuman: PlayerColor = humanWasWhiteLastRef.current ? 'black' : 'white';
    humanWasWhiteLastRef.current = newHuman === 'white';

    chessRef.current = new Chess();
    uciMovesRef.current = [];
    isAiThinkingRef.current = false;

    setHumanColor(newHuman);
    setGameStatus('playing');
    setGameResult(null);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setCheckedKingSquare(null);
    setFen(new Chess().fen());

    // If AI is white, trigger AI move first
    if (newHuman === 'black') {
      setTimeout(() => requestAiMove(newHuman), 200);
    } else {
      onMoveComplete(newHuman);
    }
  }, [requestAiMove, onMoveComplete]);

  const handleTimeout = useCallback((loser: PlayerColor) => {
    if (gameStatus !== 'playing') return;
    const result = getTimeoutResult(loser);
    endGame(result, humanColor);
  }, [gameStatus, humanColor, endGame]);

  // Custom square styles for highlights
  const customSquareStyles = useCallback((): Record<string, React.CSSProperties> => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 214, 10, 0.4)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 214, 10, 0.4)' };
    }

    if (checkedKingSquare) {
      styles[checkedKingSquare] = { backgroundColor: 'rgba(255, 30, 30, 0.6)' };
    }

    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(100, 180, 255, 0.5)' };
    }

    for (const sq of legalMoves) {
      const existing = styles[sq];
      if (existing) {
        // Merge
        styles[sq] = {
          ...existing,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.25) 28%, transparent 28%)',
          backgroundSize: '100% 100%',
        };
      } else {
        styles[sq] = {
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.25) 28%, transparent 28%)',
          backgroundSize: '100% 100%',
        };
      }
    }

    return styles;
  }, [lastMove, checkedKingSquare, selectedSquare, legalMoves]);

  return {
    fen,
    gameStatus,
    gameResult,
    humanColor,
    getChess,
    onPieceDrop,
    onSquareClick,
    startNewGame,
    handleTimeout,
    customSquareStyles,
    isAiThinking: isAiThinkingRef,
  };
}
