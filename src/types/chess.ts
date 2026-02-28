export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type GameMode = 'human-vs-ai';

export type PlayerColor = 'white' | 'black';

export type GameStatus = 'idle' | 'playing' | 'ended';

export interface GameResult {
  winner: 'white' | 'black' | 'draw' | null;
  reason: string;
  displayText: string;
}
