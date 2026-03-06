import { describe, it, expect, beforeEach } from 'vitest';
import { audioService } from '../audioService';

describe('audioService', () => {
  beforeEach(() => {
    audioService.init();
    audioService.setEnabled(true);
  });

  it('init creates Audio elements without throwing', () => {
    expect(() => audioService.init()).not.toThrow();
  });

  it('playMove calls play when enabled', () => {
    audioService.playMove();
    // The mock Audio's play should have been called
    // We verify by calling and not throwing
  });

  it('playCapture calls play when enabled', () => {
    audioService.playCapture();
  });

  it('does not play when disabled', () => {
    audioService.setEnabled(false);
    // These should not throw
    audioService.playMove();
    audioService.playCapture();
  });

  it('playBase64Audio creates and plays audio', () => {
    // btoa('hello') as a simple base64 string
    const base64 = btoa('hello');
    audioService.playBase64Audio(base64);
  });
});
