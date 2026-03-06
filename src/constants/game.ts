import type { DifficultyLevel } from '../types/chess';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string ?? 'http://localhost:5000';

export const HUB_URL = `${BACKEND_URL}/chesshub`;

export interface DifficultyConfig {
  skill: number;
  depth: number;
  moveTime: number; // ms
  elo: number;
  useLimitStrength: boolean;
  multiPV: number;       // number of candidate moves to request from Stockfish
  blunderChance: number; // 0.0–1.0, probability of picking a non-best move
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  Easy:   { skill: 0,  depth: 4,  moveTime: 300,  elo: 1320, useLimitStrength: false, multiPV: 6, blunderChance: 0.70 },
  Medium: { skill: 3,  depth: 6,  moveTime: 500,  elo: 1320, useLimitStrength: false, multiPV: 4, blunderChance: 0.30 },
  Hard:   { skill: 10, depth: 8,  moveTime: 1500, elo: 1600, useLimitStrength: true,  multiPV: 1, blunderChance: 0.0  },
  Expert: { skill: 20, depth: 16, moveTime: 2000, elo: 2000, useLimitStrength: true,  multiPV: 1, blunderChance: 0.0  },
};

// Timer constants
export const GAME_DURATION_MS = 10 * 60 * 1000; // 10 minutes
export const INCREMENT_MS = 5 * 1000;            // 5 seconds per move
export const TIMER_TICK_MS = 100;                // 100ms tick

// Minimum delay before AI plays its move (ms) — so it doesn't feel instant
export const AI_MOVE_DELAY_MS = 600;

// Typing animation speed (ms per character)
export const TYPING_SPEED_MS = 30;

// Grace period after game ends to allow chat (ms)
export const POST_GAME_GRACE_MS = 30 * 1000;

// Reconnect delays
export const RECONNECT_DELAYS = [0, 2000, 10000, 30000];

// Piece values in centipawns
export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};
