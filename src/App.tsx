import { useState, useCallback, useRef, useEffect } from 'react';
import { GameLayout } from './components/layout/GameLayout';
import { ChessBoard } from './components/board/ChessBoard';
import { PlayerBar } from './components/board/PlayerBar';
import { GameResultOverlay } from './components/board/GameResultOverlay';
import { ControlPanel } from './components/menu/ControlPanel';
import { DifficultyPopup } from './components/menu/DifficultyPopup';
import { ChatPanel } from './components/chat/ChatPanel';
import { useGame } from './hooks/useGame';
import { useStockfish } from './hooks/useStockfish';
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

  const onGameEnd = useCallback(async (result: GameResult, humanColor: PlayerColor) => {
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
  }, [chat]);

  const game = useGame({
    getBestMove,
    stockfishReady,
    difficulty,
    onGameEnd,
  });

  // Keep refs in sync with game state
  chessGetterRef.current = game.getChess;
  humanColorRef.current = game.humanColor;

  const needsGameId = useRef(false);

  const acquireGameId = useCallback(async () => {
    const gid = await signalRService.startNewGame();
    if (gid) {
      gameIdRef.current = gid;
      chat.setGameId(gid);
      chat.setPlaying(true);
      needsGameId.current = false;
    }
  }, [chat]);

  const handleNewGame = useCallback(() => {
    chat.clearMessages();
    gameIdRef.current = null;
    needsGameId.current = true;
    game.startNewGame();

    if (connected) {
      acquireGameId();
    }
  }, [chat, game, connected, acquireGameId]);

  // Acquire gameId when connection becomes available
  useEffect(() => {
    if (connected && needsGameId.current) {
      acquireGameId();
    }
  }, [connected, acquireGameId]);

  const handleReturnToIdle = useCallback(() => {
    game.resetToIdle();
    chat.setPlaying(false);
  }, [game, chat]);

  // Board layout helpers
  const {
    humanColor, gameStatus, gameResult, fen,
    onPieceDrop, onSquareClick, onPieceDragBegin, onPieceDragEnd, onRightClick,
    onPromotionSelect, pendingPromotion, customSquareStyles,
  } = game;
  const aiLabel = `AI (${difficulty})`;
  const topName = humanColor === 'white' ? aiLabel : 'You';
  const bottomName = humanColor === 'white' ? 'You' : aiLabel;

  const boardElement = (
    <div style={{ width: 680 }}>
      {/* Board card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #C8D8EB',
          borderTop: '3px solid #232F3B',
          padding: '16px',
          boxShadow: '0 2px 12px rgba(28,46,66,0.1)',
        }}
      >
        <PlayerBar name={topName} isTop />
        <div className="relative">
          <ChessBoard
            fen={fen}
            humanColor={humanColor}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onRightClick={onRightClick}
            onPromotionSelect={onPromotionSelect}
            pendingPromotion={pendingPromotion}
            customSquareStyles={customSquareStyles()}
            isInteractive={gameStatus === 'playing'}
          />
          {gameStatus === 'idle' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                background: 'rgba(19, 17, 16, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 48, opacity: 0.35 }}>♟</span>
            </div>
          )}
          {gameStatus === 'ended' && gameResult && (
            <GameResultOverlay result={gameResult} onReturnToIdle={handleReturnToIdle} />
          )}
        </div>
        <PlayerBar name={bottomName} />
      </div>
      {/* Controls bar below board */}
      <ControlPanel
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onNewGame={handleNewGame}
        onReturnToIdle={handleReturnToIdle}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        connected={connected}
        stockfishReady={stockfishReady}
        isPlaying={gameStatus === 'playing'}
      />
    </div>
  );

  return (
    <>
      <GameLayout
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
      <DifficultyPopup
        open={gameStatus === 'idle'}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onStart={handleNewGame}
        stockfishReady={stockfishReady}
      />
    </>
  );
}
