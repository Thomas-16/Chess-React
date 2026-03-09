import { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

export function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    audioService.init();

    // Unlock AudioContext on first user gesture (required for iOS/iPadOS)
    const unlockAudio = () => {
      audioService.unlock();
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setEnabled(next);
  };

  return { soundEnabled, toggleSound };
}
