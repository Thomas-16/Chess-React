import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/audioService', () => ({
  audioService: {
    init: vi.fn(),
    setEnabled: vi.fn(),
    playMove: vi.fn(),
    playCapture: vi.fn(),
    playBase64Audio: vi.fn(),
  },
}));

import { useAudio } from '../useAudio';
import { audioService } from '../../services/audioService';

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes audioService on mount', () => {
    renderHook(() => useAudio());
    expect(audioService.init).toHaveBeenCalledOnce();
  });

  it('starts with sound enabled', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.soundEnabled).toBe(true);
  });

  it('toggleSound disables sound and calls setEnabled', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(audioService.setEnabled).toHaveBeenCalledWith(false);
  });

  it('toggleSound twice re-enables sound', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      result.current.toggleSound();
    });
    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(true);
    expect(audioService.setEnabled).toHaveBeenLastCalledWith(true);
  });
});
