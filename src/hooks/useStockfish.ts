import { useState, useEffect, useCallback } from 'react';
import { stockfishService } from '../services/stockfishService';
import type { DifficultyLevel } from '../types/chess';

export function useStockfish() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    stockfishService.init()
      .then(() => setReady(true))
      .catch(err => console.error('Stockfish init failed:', err));

    return () => stockfishService.terminate();
  }, []);

  const getBestMove = useCallback(
    (fen: string, difficulty: DifficultyLevel, moves: string[]): Promise<string> => {
      return stockfishService.getBestMove(fen, difficulty, moves);
    },
    [],
  );

  return { ready, getBestMove };
}
