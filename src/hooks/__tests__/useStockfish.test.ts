import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../../services/stockfishService', () => ({
  stockfishService: {
    init: vi.fn(() => Promise.resolve()),
    getBestMove: vi.fn(() => Promise.resolve('e2e4')),
    terminate: vi.fn(),
  },
}));

import { useStockfish } from '../useStockfish';
import { stockfishService } from '../../services/stockfishService';

describe('useStockfish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls init on mount and sets ready to true', async () => {
    const { result } = renderHook(() => useStockfish());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(stockfishService.init).toHaveBeenCalledOnce();
  });

  it('calls terminate on unmount', () => {
    const { unmount } = renderHook(() => useStockfish());
    unmount();
    expect(stockfishService.terminate).toHaveBeenCalledOnce();
  });

  it('getBestMove delegates to stockfishService', async () => {
    const { result } = renderHook(() => useStockfish());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    const move = await result.current.getBestMove('fen', 'Easy', []);
    expect(move).toBe('e2e4');
    expect(stockfishService.getBestMove).toHaveBeenCalledWith('fen', 'Easy', []);
  });
});
