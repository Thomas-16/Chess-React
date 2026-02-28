import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { signalRService } from '../services/signalRService';
import { audioService } from '../services/audioService';
import { buildPositionContext } from '../services/positionContext';
import type { ChatMessage } from '../types/chat';
import type { PlayerColor } from '../types/chess';
import type { Chess } from 'chess.js';
import { TYPING_SPEED_MS, POST_GAME_GRACE_MS } from '../constants/game';
import type { ChatResponsePayload } from '../services/signalRService';

interface UseChatProps {
  getChess: () => Chess;
  getHumanColor: () => PlayerColor;
}

export function useChat({ getChess, getHumanColor }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const gameIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const clearTypingInterval = useCallback((id: string) => {
    const iv = typingIntervalsRef.current.get(id);
    if (iv) {
      clearInterval(iv);
      typingIntervalsRef.current.delete(id);
    }
  }, []);

  const startTypingEffect = useCallback((msgId: string, fullText: string) => {
    let visible = 0;
    const iv = setInterval(() => {
      visible++;
      setMessages(prev => prev.map(m =>
        m.id === msgId
          ? { ...m, visibleChars: visible, isTyping: visible < fullText.length }
          : m
      ));
      if (visible >= fullText.length) {
        clearInterval(iv);
        typingIntervalsRef.current.delete(msgId);
      }
    }, TYPING_SPEED_MS);
    typingIntervalsRef.current.set(msgId, iv);
  }, []);

  const handleChatResponse = useCallback((payload: ChatResponsePayload) => {
    setIsWaiting(false);
    const msgId = uuidv4();
    const aiMsg: ChatMessage = {
      id: msgId,
      speaker: 'ai',
      text: payload.message,
      timestamp: new Date(payload.timestamp),
      isTyping: true,
      visibleChars: 0,
    };
    setMessages(prev => [...prev, aiMsg]);
    startTypingEffect(msgId, payload.message);

    if (payload.audio) {
      audioService.playBase64Audio(payload.audio);
    }
  }, [startTypingEffect]);

  const handleChatError = useCallback((msg: string) => {
    setIsWaiting(false);
    console.error('Chat error:', msg);
  }, []);

  const setGameId = useCallback((id: string | null) => {
    gameIdRef.current = id;
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    if (!playing && gameIdRef.current) {
      // Start grace period timer
      graceTimerRef.current = setTimeout(() => {
        gameIdRef.current = null;
      }, POST_GAME_GRACE_MS);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!gameIdRef.current || isWaiting) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      speaker: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsWaiting(true);

    const chess = getChess();
    const context = buildPositionContext(chess, getHumanColor(), isPlayingRef.current);

    await signalRService.sendChatMessage(gameIdRef.current, text, context);
  }, [isWaiting, getChess, getHumanColor]);

  const sendAutomaticMessage = useCallback(async (prompt: string) => {
    if (!gameIdRef.current) return;

    const chess = getChess();
    const context = buildPositionContext(chess, getHumanColor(), false);

    await signalRService.sendChatMessage(gameIdRef.current, prompt, context);
    setIsWaiting(true);
  }, [getChess, getHumanColor]);

  const clearMessages = useCallback(() => {
    // Clear all typing intervals
    typingIntervalsRef.current.forEach((_, id) => clearTypingInterval(id));
    setMessages([]);
    setIsWaiting(false);
  }, [clearTypingInterval]);

  useEffect(() => {
    return () => {
      typingIntervalsRef.current.forEach((iv) => clearInterval(iv));
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, []);

  return {
    messages,
    isWaiting,
    handleChatResponse,
    handleChatError,
    setGameId,
    setPlaying,
    sendMessage,
    sendAutomaticMessage,
    clearMessages,
    hasGameId: () => !!gameIdRef.current,
  };
}
