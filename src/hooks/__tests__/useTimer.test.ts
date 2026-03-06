import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with 10 minutes for both players and no active color', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    expect(result.current.whiteMs).toBe(600000);
    expect(result.current.blackMs).toBe(600000);
    expect(result.current.activeColor).toBeNull();
  });

  it('startTimer begins countdown for specified color', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    expect(result.current.activeColor).toBe('white');

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.whiteMs).toBe(599000);
    expect(result.current.blackMs).toBe(600000);
  });

  it('switchTurn changes active color', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.switchTurn('black');
    });

    expect(result.current.activeColor).toBe('black');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Black should have decreased, white should stay where it was
    expect(result.current.blackMs).toBe(599000);
    expect(result.current.whiteMs).toBe(599500);
  });

  it('addIncrement adds 5 seconds to specified color', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.addIncrement('white');
    });

    expect(result.current.whiteMs).toBe(603000); // 600000 - 2000 + 5000
  });

  it('stopTimer halts countdown', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.stopTimer();
    });

    const timeAfterStop = result.current.whiteMs;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.whiteMs).toBe(timeAfterStop);
    expect(result.current.activeColor).toBeNull();
  });

  it('resetTimer restores initial state', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.whiteMs).toBe(600000);
    expect(result.current.blackMs).toBe(600000);
    expect(result.current.activeColor).toBeNull();
  });

  it('calls onTimeout when time runs out', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useTimer(onTimeout));

    act(() => {
      result.current.startTimer('white');
    });

    // Advance past 10 minutes
    act(() => {
      vi.advanceTimersByTime(600100);
    });

    expect(result.current.whiteMs).toBe(0);

    // onTimeout is called via setTimeout(..., 0), so flush
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onTimeout).toHaveBeenCalledWith('white');
  });
});
