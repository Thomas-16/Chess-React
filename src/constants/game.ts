import type { DifficultyLevel } from '../types/chess';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string ?? 'http://localhost:5000';

export const HUB_URL = `${BACKEND_URL}/chesshub`;

export interface DifficultyConfig {
  skill: number;
  depth: number;
  moveTime: number; // ms
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  Easy:   { skill: 0,  depth: 3,  moveTime: 500 },
  Medium: { skill: 5,  depth: 6,  moveTime: 1000 },
  Hard:   { skill: 15, depth: 12, moveTime: 1500 },
  Expert: { skill: 20, depth: 20, moveTime: 2000 },
};

// Minimum delay before AI plays its move (ms) — so it doesn't feel instant
export const AI_MOVE_DELAY_MS = 400;

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
