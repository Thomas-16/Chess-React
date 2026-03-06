# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # tsc -b + vite build (TypeScript check first)
npm run lint      # ESLint check
npm test          # Run tests once with Vitest
npm run test:watch # Run tests in watch mode
npm run preview   # Preview production build
```

## Testing

After any large change (new features, refactors, bug fixes affecting multiple files), run the test suite:

```bash
npm test
```

Fix any test failures before committing. Tests live alongside source code in `__tests__/` directories using Vitest + React Testing Library. If you change behavior in a hook, service, or component, update or add corresponding tests.

## Architecture

### Hook Composition (App.tsx)
`App.tsx` orchestrates 6 custom hooks in dependency order:
1. `useStockfish()` → provides `getBestMove`
2. `useAudio()` → sound toggle
3. `useChat({ getChess, getHumanColor })` → chat logic
4. `useSignalR({ onChatResponse })` → WebSocket events
5. `useGame({ getBestMove, onGameEnd })` → core chess logic
6. `useTimer()` → chess clock (built but not currently wired into UI)

### Cross-Hook Stale Closure Pattern
`chess.js` is stored as a `useRef` (mutable), FEN extracted to state after each move. `useChat` needs access to the current chess position but can't take it directly as a prop (would create stale closures). The solution in `App.tsx`: pass getter functions (`getChess`, `getHumanColor`) that read from refs updated each render:

```typescript
chessGetterRef.current = game.getChess;  // updated after every render
humanColorRef.current = game.humanColor;
// stable callbacks passed to useChat:
getChess: useCallback(() => chessGetterRef.current(), [])
```

### Game Flow
1. Human drops piece → `onPieceDrop` → `executeHumanMove()` → check game end → `requestAiMove()`
2. AI move: `getBestMove()` (Stockfish UCI) → 400ms delay → apply move → check game end
3. Game ends → `onGameEnd()` in App.tsx → auto-chat + `saveGameResult()` via SignalR → 30s grace period

### Services (Singletons)
- `signalRService.ts` — Single HubConnection, auto-reconnect `[0, 2s, 10s, 30s]`, handlers registered before `start()`
- `stockfishService.ts` — UCI protocol over `new Worker('/stockfish/stockfish.js')`, loaded from `public/`
- `audioService.ts` — Sound playback for moves/captures
- `positionContext.ts` — Builds `ChessPositionContext` from chess.js for backend chat API

### Stockfish
Uses `stockfish-18-lite-single` (7MB WASM, single-threaded). No `SharedArrayBuffer`/COOP headers needed. Excluded from Vite pre-bundling (`optimizeDeps.exclude`). Binary lives in `public/stockfish/`.

### Backend (Chess-Backend at `localhost:5000`)
Hub: `/chesshub`
- Client→Server: `StartNewGame()→string`, `SendChatMessage(gameId, msg, ctx?)`, `SaveGameResult(gameId, pgn, result)`, `GetChatHistory(gameId)`
- Server→Client: `ReceiveChatResponse({gameId, message, audio, timestamp})`, `GameSaved`, `ChatError`, `SaveError`

### Difficulty Levels (`constants/game.ts`)
| Level  | skill | depth | moveTime |
|--------|-------|-------|----------|
| Easy   | 0     | 3     | 500ms    |
| Medium | 5     | 6     | 1000ms   |
| Hard   | 15    | 12    | 1500ms   |
| Expert | 20    | 20    | 2000ms   |

### Key Types
- `DifficultyLevel` = `'Easy' | 'Medium' | 'Hard' | 'Expert'`
- `PlayerColor` = `'white' | 'black'`
- `GameStatus` = `'idle' | 'playing' | 'ended'`
- `ChessPositionContext` — built by `positionContext.ts`, sent with chat messages

### UI
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- Fonts loaded from Google Fonts: Playfair Display, Crimson Text, JetBrains Mono
- Layout: menu (200px) | board (580px) | chat (360px), gap 36px
- Board colors: light `#E8D9B8`, dark `#5C3A20`
- Theme: charcoal bg `#131110`, cream `#F0E8D8`, amber accent `#C8922A`

### Environment Variables
- `VITE_BACKEND_URL` — SignalR hub base URL (defaults to `http://localhost:5000`)
- `VITE_GROQ_API_KEY` — Optional, enables voice input via Groq Whisper transcription

### TypeScript Notes
- `jsx: "react-jsx"` — no `import React` needed in components
- `strict: true`, `noUnusedLocals`, `noUnusedParameters` — all enforced at build time
