import { useState, useRef, useEffect, useCallback } from 'react';
import { GAME_DURATION_MS, INCREMENT_MS, TIMER_TICK_MS } from '../constants/game';
import type { PlayerColor } from '../types/chess';

interface TimerState {
  whiteMs: number;
  blackMs: number;
}

interface UseTimerReturn extends TimerState {
  activeColor: PlayerColor | null;
  startTimer: (color: PlayerColor) => void;
  switchTurn: (nextColor: PlayerColor) => void;
  addIncrement: (color: PlayerColor) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useTimer(onTimeout: (loser: PlayerColor) => void): UseTimerReturn {
  const [state, setState] = useState<TimerState>({
    whiteMs: GAME_DURATION_MS,
    blackMs: GAME_DURATION_MS,
  });
  const [activeColor, setActiveColor] = useState<PlayerColor | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeColorRef = useRef<PlayerColor | null>(null);

  const clearTick = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const color = activeColorRef.current;
        if (!color) return prev;

        const key = color === 'white' ? 'whiteMs' : 'blackMs';
        const newMs = prev[key] - TIMER_TICK_MS;

        if (newMs <= 0) {
          clearTick();
          // Trigger timeout outside of setState
          setTimeout(() => onTimeout(color), 0);
          return { ...prev, [key]: 0 };
        }

        return { ...prev, [key]: newMs };
      });
    }, TIMER_TICK_MS);
  }, [onTimeout]);

  const startTimer = useCallback((color: PlayerColor) => {
    activeColorRef.current = color;
    setActiveColor(color);
    startTick();
  }, [startTick]);

  const switchTurn = useCallback((nextColor: PlayerColor) => {
    activeColorRef.current = nextColor;
    setActiveColor(nextColor);
  }, []);

  const addIncrement = useCallback((color: PlayerColor) => {
    setState(prev => {
      const key = color === 'white' ? 'whiteMs' : 'blackMs';
      return { ...prev, [key]: prev[key] + INCREMENT_MS };
    });
  }, []);

  const stopTimer = useCallback(() => {
    clearTick();
    activeColorRef.current = null;
    setActiveColor(null);
  }, []);

  const resetTimer = useCallback(() => {
    clearTick();
    activeColorRef.current = null;
    setActiveColor(null);
    setState({ whiteMs: GAME_DURATION_MS, blackMs: GAME_DURATION_MS });
  }, []);

  useEffect(() => {
    return () => clearTick();
  }, []);

  return {
    whiteMs: state.whiteMs,
    blackMs: state.blackMs,
    activeColor,
    startTimer,
    switchTurn,
    addIncrement,
    stopTimer,
    resetTimer,
  };
}
