import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../../services/signalRService', () => ({
  signalRService: {
    connect: vi.fn((_a: unknown, _b: unknown, _c: unknown, onStatus: (c: boolean) => void) => {
      onStatus(true);
      return Promise.resolve();
    }),
    disconnect: vi.fn(),
    startNewGame: vi.fn(() => Promise.resolve('game-abc')),
  },
}));

import { useSignalR } from '../useSignalR';
import { signalRService } from '../../services/signalRService';

describe('useSignalR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('connects on mount with callbacks', async () => {
    const onChat = vi.fn();
    const onError = vi.fn();
    const onSaved = vi.fn();

    const { result } = renderHook(() =>
      useSignalR({ onChatResponse: onChat, onChatError: onError, onGameSaved: onSaved }),
    );

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });

    expect(signalRService.connect).toHaveBeenCalledWith(
      onChat,
      onError,
      onSaved,
      expect.any(Function),
    );
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() =>
      useSignalR({ onChatResponse: vi.fn(), onChatError: vi.fn(), onGameSaved: vi.fn() }),
    );

    unmount();
    expect(signalRService.disconnect).toHaveBeenCalled();
  });

  it('startNewGame delegates to signalRService', async () => {
    const { result } = renderHook(() =>
      useSignalR({ onChatResponse: vi.fn(), onChatError: vi.fn(), onGameSaved: vi.fn() }),
    );

    const gameId = await result.current.startNewGame();
    expect(gameId).toBe('game-abc');
    expect(signalRService.startNewGame).toHaveBeenCalled();
  });
});
