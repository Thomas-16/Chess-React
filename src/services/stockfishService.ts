import { DIFFICULTY_CONFIGS } from '../constants/game';
import type { DifficultyLevel } from '../types/chess';

type MoveCallback = (move: string) => void;

class StockfishService {
  private worker: Worker | null = null;
  private moveCallback: MoveCallback | null = null;
  private ready = false;

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/stockfish/stockfish.js');

        this.worker.onmessage = (e: MessageEvent<string>) => {
          const line = e.data;
          if (line === 'uciok') {
            this.worker!.postMessage('isready');
          } else if (line === 'readyok') {
            this.ready = true;
            resolve();
          } else if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            const move = parts[1];
            if (move && move !== '(none)' && this.moveCallback) {
              this.moveCallback(move);
              this.moveCallback = null;
            }
          }
        };

        this.worker.onerror = (e) => {
          console.error('Stockfish worker error:', e);
          reject(e);
        };

        this.worker.postMessage('uci');
      } catch (err) {
        reject(err);
      }
    });
  }

  getBestMove(fen: string, difficulty: DifficultyLevel, moves: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.ready) {
        reject(new Error('Stockfish not ready'));
        return;
      }

      const config = DIFFICULTY_CONFIGS[difficulty];

      this.moveCallback = resolve;

      this.worker.postMessage('ucinewgame');

      if (config.useLimitStrength) {
        this.worker.postMessage('setoption name UCI_LimitStrength value true');
        this.worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
      } else {
        this.worker.postMessage('setoption name UCI_LimitStrength value false');
      }

      this.worker.postMessage(`setoption name Skill Level value ${config.skill}`);

      const movesStr = moves.length > 0 ? ` moves ${moves.join(' ')}` : '';
      this.worker.postMessage(`position fen ${fen}${movesStr}`);
      this.worker.postMessage(`go depth ${config.depth} movetime ${config.moveTime}`);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}

export const stockfishService = new StockfishService();
