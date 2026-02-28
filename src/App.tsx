import { useState, useCallback, useRef } from 'react';
import { GameLayout } from './components/layout/GameLayout';
import { ChessBoard } from './components/board/ChessBoard';
import { PlayerBar } from './components/board/PlayerBar';
import { GameResultOverlay } from './components/board/GameResultOverlay';
import { ControlPanel } from './components/menu/ControlPanel';
import { ChatPanel } from './components/chat/ChatPanel';
import { useGame } from './hooks/useGame';
import { useStockfish } from './hooks/useStockfish';
import { useTimer } from './hooks/useTimer';
import { useAudio } from './hooks/useAudio';
import { useSignalR } from './hooks/useSignalR';
import { useChat } from './hooks/useChat';
import { signalRService } from './services/signalRService';
import { buildPgn, getResultString } from './utils/pgn';
import { getGameEndChatPrompt } from './utils/gameResult';
import type { DifficultyLevel, PlayerColor, GameResult } from './types/chess';
import type { Chess } from 'chess.js';

export default function App() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');

  // Refs for cross-hook communication (avoids stale closure issues)
  const gameIdRef = useRef<string | null>(null);
  const chessGetterRef = useRef<(() => Chess) | null>(null);
  const humanColorRef = useRef<PlayerColor>('white');

  const { ready: stockfishReady, getBestMove } = useStockfish();
  const { soundEnabled, toggleSound } = useAudio();

  // Chat hook uses stable getter functions that delegate to refs
  const chat = useChat({
    getChess: useCallback(() => {
      if (!chessGetterRef.current) throw new Error('Chess not initialized');
      return chessGetterRef.current();
    }, []),
    getHumanColor: useCallback(() => humanColorRef.current, []),
  });

  const { connected } = useSignalR({
    onChatResponse: chat.handleChatResponse,
    onChatError: chat.handleChatError,
    onGameSaved: useCallback((id: string) => console.log('Game saved:', id), []),
  });

  // Timer: uses a ref for timeout callback to avoid stale closures
  const handleTimeoutRef = useRef<(loser: PlayerColor) => void>(() => {});
  const timer = useTimer(useCallback((loser: PlayerColor) => {
    handleTimeoutRef.current(loser);
  }, []));

  const onMoveComplete = useCallback((nextTurn: PlayerColor) => {
    timer.switchTurn(nextTurn);
  }, [timer]);

  const onGameEnd = useCallback(async (result: GameResult, humanColor: PlayerColor) => {
    timer.stopTimer();
    chat.setPlaying(false);

    // Auto-chat
    setTimeout(() => {
      const prompt = getGameEndChatPrompt(result, humanColor);
      chat.sendAutomaticMessage(prompt);
    }, 500);

    // Save game to backend
    if (gameIdRef.current && chessGetterRef.current) {
      const chess = chessGetterRef.current();
      const pgn = buildPgn(chess, result, humanColor);
      const resultStr = getResultString(result);
      await signalRService.saveGameResult(gameIdRef.current, pgn, resultStr);
    }
  }, [timer, chat]);

  const game = useGame({
    getBestMove,
    stockfishReady,
    difficulty,
    onGameEnd,
    onMoveComplete,
  });

  // Keep refs in sync with game state
  chessGetterRef.current = game.getChess;
  humanColorRef.current = game.humanColor;
  handleTimeoutRef.current = game.handleTimeout;

  const handleNewGame = useCallback(async () => {
    timer.resetTimer();
    chat.clearMessages();
    game.startNewGame();

    // Defer until after startNewGame updates humanColor state
    setTimeout(async () => {
      const hColor = humanColorRef.current;
      // Start timer for whoever moves first (human if white, else wait for AI to move first)
      timer.startTimer(hColor === 'white' ? 'white' : 'black');

      if (connected) {
        const gid = await signalRService.startNewGame();
        if (gid) {
          gameIdRef.current = gid;
          chat.setGameId(gid);
          chat.setPlaying(true);
        }
      }
    }, 100);
  }, [timer, chat, game, connected]);

  // Board layout helpers
  const { humanColor, gameStatus, gameResult, fen, onPieceDrop, onSquareClick, customSquareStyles } = game;
  const aiLabel = `Stockfish (${difficulty})`;
  const topName = humanColor === 'white' ? aiLabel : 'You';
  const bottomName = humanColor === 'white' ? 'You' : aiLabel;
  const topColor: PlayerColor = humanColor === 'white' ? 'black' : 'white';
  const topMs = topColor === 'white' ? timer.whiteMs : timer.blackMs;
  const bottomMs = humanColor === 'white' ? timer.whiteMs : timer.blackMs;

  const boardElement = (
    <div className="relative flex flex-col" style={{ width: 560 }}>
      <PlayerBar name={topName} timeMs={topMs} isActive={timer.activeColor === topColor} isTop />
      <div className="relative">
        <ChessBoard
          fen={fen}
          humanColor={humanColor}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={customSquareStyles()}
          isInteractive={gameStatus === 'playing'}
        />
        {gameStatus === 'ended' && gameResult && (
          <GameResultOverlay result={gameResult} onNewGame={handleNewGame} />
        )}
      </div>
      <PlayerBar name={bottomName} timeMs={bottomMs} isActive={timer.activeColor === humanColor} />
    </div>
  );

  return (
    <GameLayout
      menu={
        <ControlPanel
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onNewGame={handleNewGame}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          connected={connected}
          stockfishReady={stockfishReady}
          isPlaying={gameStatus === 'playing'}
        />
      }
      board={boardElement}
      chat={
        <ChatPanel
          messages={chat.messages}
          isWaiting={chat.isWaiting}
          onSend={chat.sendMessage}
          hasGame={chat.hasGameId()}
          connected={connected}
        />
      }
    />
  );
}
