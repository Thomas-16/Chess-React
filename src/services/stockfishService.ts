import { DIFFICULTY_CONFIGS, type DifficultyConfig } from '../constants/game';
import type { DifficultyLevel } from '../types/chess';

type MoveCallback = (move: string) => void;

interface CandidateMove {
  pvIndex: number;
  move: string;
  score: number;
}

class StockfishService {
  private worker: Worker | null = null;
  private moveCallback: MoveCallback | null = null;
  private ready = false;
  private candidateMoves: CandidateMove[] = [];
  private currentConfig: DifficultyConfig | null = null;

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
          } else if (line.startsWith('info') && line.includes('multipv') && line.includes(' pv ')) {
            const candidate = this.parseInfoLine(line);
            if (candidate) {
              const idx = this.candidateMoves.findIndex(c => c.pvIndex === candidate.pvIndex);
              if (idx >= 0) {
                this.candidateMoves[idx] = candidate;
              } else {
                this.candidateMoves.push(candidate);
              }
            }
          } else if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            const bestMove = parts[1];
            if (bestMove && bestMove !== '(none)' && this.moveCallback) {
              const selectedMove = this.selectMove(bestMove);
              this.moveCallback(selectedMove);
              this.moveCallback = null;
              this.candidateMoves = [];
              this.currentConfig = null;
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

  private parseInfoLine(line: string): CandidateMove | null {
    const tokens = line.split(/\s+/);

    const mpvIdx = tokens.indexOf('multipv');
    if (mpvIdx < 0 || mpvIdx + 1 >= tokens.length) return null;
    const pvIndex = parseInt(tokens[mpvIdx + 1], 10);
    if (isNaN(pvIndex)) return null;

    const scoreIdx = tokens.indexOf('score');
    if (scoreIdx < 0 || scoreIdx + 2 >= tokens.length) return null;
    const scoreType = tokens[scoreIdx + 1];
    const scoreVal = parseInt(tokens[scoreIdx + 2], 10);
    if (isNaN(scoreVal)) return null;

    let score: number;
    if (scoreType === 'cp') {
      score = scoreVal;
    } else if (scoreType === 'mate') {
      score = scoreVal > 0 ? 100000 - scoreVal : -100000 - scoreVal;
    } else {
      return null;
    }

    const pvIdx = tokens.indexOf('pv');
    if (pvIdx < 0 || pvIdx + 1 >= tokens.length) return null;
    const move = tokens[pvIdx + 1];

    return { pvIndex, move, score };
  }

  private selectMove(bestMove: string): string {
    const config = this.currentConfig;

    if (!config || config.multiPV <= 1 || config.blunderChance <= 0) {
      return bestMove;
    }

    const sorted = [...this.candidateMoves].sort((a, b) => b.score - a.score);

    if (sorted.length <= 1) {
      return bestMove;
    }

    // Roll: should we blunder?
    if (Math.random() >= config.blunderChance) {
      return sorted[0]?.move ?? bestMove;
    }

    // Blunder path: pick from non-best candidates, weighted toward worse moves
    const nonBest = sorted.slice(1);
    const weights = nonBest.map((_, i) => i + 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let roll = Math.random() * totalWeight;
    for (let i = 0; i < nonBest.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return nonBest[i].move;
      }
    }

    return nonBest[nonBest.length - 1].move;
  }

  getBestMove(fen: string, difficulty: DifficultyLevel, moves: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.ready) {
        reject(new Error('Stockfish not ready'));
        return;
      }

      const config = DIFFICULTY_CONFIGS[difficulty];

      this.candidateMoves = [];
      this.currentConfig = config;
      this.moveCallback = resolve;

      this.worker.postMessage('ucinewgame');

      if (config.useLimitStrength) {
        this.worker.postMessage('setoption name UCI_LimitStrength value true');
        this.worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
      } else {
        this.worker.postMessage('setoption name UCI_LimitStrength value false');
      }

      this.worker.postMessage(`setoption name Skill Level value ${config.skill}`);
      this.worker.postMessage(`setoption name MultiPV value ${config.multiPV}`);

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
