import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Chess } from 'chess.js';

vi.mock('../../services/signalRService', () => ({
  signalRService: {
    sendChatMessage: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../../services/audioService', () => ({
  audioService: {
    playBase64Audio: vi.fn(),
  },
}));

vi.mock('../../services/positionContext', () => ({
  buildPositionContext: vi.fn(() => null),
}));

import { useChat } from '../useChat';
import { signalRService } from '../../services/signalRService';

function createChatProps() {
  return {
    getChess: () => new Chess(),
    getHumanColor: () => 'white' as const,
  };
}

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty messages and not waiting', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isWaiting).toBe(false);
  });

  it('hasGameId returns false initially', () => {
    const { result } = renderHook(() => useChat(createChatProps()));
    expect(result.current.hasGameId()).toBe(false);
  });

  it('setGameId makes hasGameId return true', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.setGameId('game-123');
    });

    expect(result.current.hasGameId()).toBe(true);
  });

  it('sendMessage does nothing without gameId', async () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    await act(async () => {
      await result.current.sendMessage('hello');
    });

    expect(result.current.messages).toEqual([]);
    expect(signalRService.sendChatMessage).not.toHaveBeenCalled();
  });

  it('sendMessage adds user message and calls signalR', async () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.setGameId('game-123');
    });

    await act(async () => {
      await result.current.sendMessage('hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].speaker).toBe('user');
    expect(result.current.messages[0].text).toBe('hello');
    expect(result.current.isWaiting).toBe(true);
    expect(signalRService.sendChatMessage).toHaveBeenCalledWith(
      'game-123',
      'hello',
      null,
    );
  });

  it('sendMessage does not send when already waiting', async () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.setGameId('game-123');
    });

    await act(async () => {
      await result.current.sendMessage('first');
    });

    // Now isWaiting is true
    await act(async () => {
      await result.current.sendMessage('second');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(signalRService.sendChatMessage).toHaveBeenCalledTimes(1);
  });

  it('handleChatResponse adds AI message with typing state', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.handleChatResponse({
        gameId: 'game-1',
        message: 'Hello there!',
        audio: '',
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].speaker).toBe('ai');
    expect(result.current.messages[0].text).toBe('Hello there!');
    expect(result.current.messages[0].isTyping).toBe(true);
    expect(result.current.messages[0].visibleChars).toBe(0);
    expect(result.current.isWaiting).toBe(false);
  });

  it('typing effect reveals characters over time', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.handleChatResponse({
        gameId: 'game-1',
        message: 'Hi!',
        audio: '',
        timestamp: new Date().toISOString(),
      });
    });

    // Advance typing by a few characters (30ms per char)
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(result.current.messages[0].visibleChars).toBe(1);

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(result.current.messages[0].visibleChars).toBe(2);

    // After all chars revealed
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(result.current.messages[0].visibleChars).toBe(3);
    expect(result.current.messages[0].isTyping).toBe(false);
  });

  it('handleChatError clears waiting state', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    // Set waiting first
    act(() => {
      result.current.setGameId('game-1');
    });

    act(() => {
      result.current.handleChatError('some error');
    });

    expect(result.current.isWaiting).toBe(false);
  });

  it('setPlaying(false) starts grace period timer', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.setGameId('game-123');
    });

    act(() => {
      result.current.setPlaying(false);
    });

    // GameId should still be set during grace period
    expect(result.current.hasGameId()).toBe(true);

    // After 30 seconds grace period
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.hasGameId()).toBe(false);
  });

  it('clearMessages empties message list', () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.handleChatResponse({
        gameId: 'game-1',
        message: 'test',
        audio: '',
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isWaiting).toBe(false);
  });

  it('sendAutomaticMessage sends without adding user message', async () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    act(() => {
      result.current.setGameId('game-123');
    });

    await act(async () => {
      await result.current.sendAutomaticMessage('You won! React to this.');
    });

    // No user message added
    expect(result.current.messages).toEqual([]);
    // But signalR was called
    expect(signalRService.sendChatMessage).toHaveBeenCalledWith(
      'game-123',
      'You won! React to this.',
      null,
    );
    expect(result.current.isWaiting).toBe(true);
  });

  it('sendAutomaticMessage does nothing without gameId', async () => {
    const { result } = renderHook(() => useChat(createChatProps()));

    await act(async () => {
      await result.current.sendAutomaticMessage('prompt');
    });

    expect(signalRService.sendChatMessage).not.toHaveBeenCalled();
  });
});
