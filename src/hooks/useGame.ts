import { useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { DifficultyLevel, PlayerColor, GameResult, GameStatus } from '../types/chess';
import { audioService } from '../services/audioService';
import { getGameResult, getTimeoutResult } from '../utils/gameResult';
import { AI_MOVE_DELAY_MS } from '../constants/game';

interface UseGameProps {
  getBestMove: (fen: string, difficulty: DifficultyLevel, moves: string[]) => Promise<string>;
  stockfishReady: boolean;
  difficulty: DifficultyLevel;
  onGameEnd: (result: GameResult, humanColor: PlayerColor) => void;
}

function isPawnPromotion(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from);
  if (piece?.type !== 'p') return false;
  const toRank = to[1];
  return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
}

export function useGame({
  getBestMove,
  stockfishReady,
  difficulty,
  onGameEnd,
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
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const getChess = useCallback(() => chessRef.current, []);

  const syncFen = useCallback(() => {
    const chess = chessRef.current;
    setFen(chess.fen());

    // Check highlight
    if (chess.isCheck()) {
      const turn = chess.turn();
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
    setPendingPromotion(null);
    onGameEnd(result, color);
  }, [onGameEnd]);

  const requestAiMove = useCallback(async (currentHumanColor: PlayerColor) => {
    if (isAiThinkingRef.current || !stockfishReady) return;
    isAiThinkingRef.current = true;

    try {
      const chess = chessRef.current;
      const startTime = Date.now();
      const move = await getBestMove(chess.fen(), difficulty, uciMovesRef.current);

      if (chessRef.current !== chess && !chess.fen().includes(chessRef.current.fen().substring(0, 20))) {
        isAiThinkingRef.current = false;
        return;
      }

      const elapsed = Date.now() - startTime;
      const remaining = AI_MOVE_DELAY_MS - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
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
      }
    } catch (err) {
      console.error('AI move error:', err);
    } finally {
      isAiThinkingRef.current = false;
    }
  }, [getBestMove, difficulty, stockfishReady, syncFen, endGame]);

  const executeHumanMove = useCallback((from: Square, to: Square, promotionPiece?: string): boolean => {
    const chess = chessRef.current;
    const moveObj: { from: Square; to: Square; promotion?: string } = { from, to };
    if (promotionPiece) moveObj.promotion = promotionPiece;

    const result = chess.move(moveObj);
    if (!result) return false;

    const uciMove = from + to + (result.promotion ?? '');
    uciMovesRef.current.push(uciMove);

    const isCapture = result.captured !== undefined;
    if (isCapture) audioService.playCapture();
    else audioService.playMove();

    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    syncFen();

    const gameRes = getGameResult(chess);
    if (gameRes) {
      endGame(gameRes, humanColor);
      return true;
    }

    requestAiMove(humanColor);
    return true;
  }, [humanColor, syncFen, endGame, requestAiMove]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, _piece: string): boolean => {
    const chess = chessRef.current;
    if (gameStatus !== 'playing') return false;

    const turn = chess.turn();
    const isHumanTurn = (turn === 'w' && humanColor === 'white') || (turn === 'b' && humanColor === 'black');
    if (!isHumanTurn || isAiThinkingRef.current) return false;

    // Validate it's a legal move at all before doing anything
    const legal = chess.moves({ square: sourceSquare, verbose: true }).some(m => m.to === targetSquare);
    if (!legal) return false;

    // Show promotion dialog for pawn promotion
    if (isPawnPromotion(chess, sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setSelectedSquare(sourceSquare);
      const moves = chess.moves({ square: sourceSquare, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
      return false; // Piece snaps back; dialog will appear
    }

    return executeHumanMove(sourceSquare, targetSquare);
  }, [gameStatus, humanColor, executeHumanMove]);

  // Called when user picks a promotion piece from the dialog
  const onPromotionSelect = useCallback((
    piece?: string,
    fromSquare?: Square,
    toSquare?: Square,
  ): boolean => {
    if (!piece || !fromSquare || !toSquare) {
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
      return false;
    }
    // piece is like 'wQ', 'bR' etc.
    const promotionPiece = piece[1]?.toLowerCase();
    return executeHumanMove(fromSquare, toSquare, promotionPiece);
  }, [executeHumanMove]);

  const onSquareClick = useCallback((square: Square) => {
    const chess = chessRef.current;
    if (gameStatus !== 'playing') return;

    const turn = chess.turn();
    const isHumanTurn = (turn === 'w' && humanColor === 'white') || (turn === 'b' && humanColor === 'black');
    if (!isHumanTurn || isAiThinkingRef.current) return;

    const piece = chess.get(square);

    // Click the selected piece again → deselect
    if (square === selectedSquare) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Click a legal target square while a piece is selected
    if (selectedSquare && legalMoves.includes(square)) {
      if (isPawnPromotion(chess, selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      executeHumanMove(selectedSquare, square);
      return;
    }

    // Select own piece (or switch selection to another piece)
    if (piece && ((piece.color === 'w' && humanColor === 'white') || (piece.color === 'b' && humanColor === 'black'))) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [gameStatus, humanColor, selectedSquare, legalMoves, executeHumanMove]);

  // Show legal moves when the user starts dragging a piece
  const onPieceDragBegin = useCallback((_piece: string, sourceSquare: Square) => {
    const chess = chessRef.current;
    if (gameStatus !== 'playing') return;
    const turn = chess.turn();
    const isHumanTurn = (turn === 'w' && humanColor === 'white') || (turn === 'b' && humanColor === 'black');
    if (!isHumanTurn || isAiThinkingRef.current) return;

    setSelectedSquare(sourceSquare);
    const moves = chess.moves({ square: sourceSquare, verbose: true });
    setLegalMoves(moves.map(m => m.to as Square));
  }, [gameStatus, humanColor]);

  // Clear selection after drag ends (successful drop handled by onPieceDrop already)
  const onPieceDragEnd = useCallback((_piece: string, _sq: Square) => {
    // Don't clear if promotion dialog is showing
    setPendingPromotion(prev => {
      if (!prev) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
      return prev;
    });
  }, []);

  // Right-click to cancel selection
  const onRightClick = useCallback((_square: Square) => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
  }, []);

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
    setPendingPromotion(null);
    setFen(new Chess().fen());

    if (newHuman === 'black') {
      setTimeout(() => requestAiMove(newHuman), 200);
    }
  }, [requestAiMove]);

  const handleTimeout = useCallback((loser: PlayerColor) => {
    if (gameStatus !== 'playing') return;
    const result = getTimeoutResult(loser);
    endGame(result, humanColor);
  }, [gameStatus, humanColor, endGame]);

  // Custom square styles
  const customSquareStyles = useCallback((): Record<string, React.CSSProperties> => {
    const styles: Record<string, React.CSSProperties> = {};
    const chess = chessRef.current;

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 214, 10, 0.35)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 214, 10, 0.35)' };
    }

    if (checkedKingSquare) {
      styles[checkedKingSquare] = { backgroundColor: 'rgba(220, 50, 50, 0.65)' };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: 'rgba(80, 160, 255, 0.5)',
      };
    }

    for (const sq of legalMoves) {
      const existing = styles[sq];
      const hasPiece = !!chess.get(sq);

      if (hasPiece) {
        // Capturable piece: ring overlay
        styles[sq] = {
          ...existing,
          backgroundImage: [
            existing?.backgroundImage,
            'radial-gradient(circle, transparent 56%, rgba(0,0,0,0.22) 56%, rgba(0,0,0,0.22) 74%, transparent 74%)',
          ].filter(Boolean).join(', '),
        };
      } else {
        // Empty square: small dot
        styles[sq] = {
          ...existing,
          backgroundImage: [
            existing?.backgroundImage,
            'radial-gradient(circle, rgba(0,0,0,0.22) 28%, transparent 28%)',
          ].filter(Boolean).join(', '),
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
    onPieceDragBegin,
    onPieceDragEnd,
    onRightClick,
    onPromotionSelect,
    pendingPromotion,
    startNewGame,
    handleTimeout,
    customSquareStyles,
    isAiThinking: isAiThinkingRef,
  };
}
