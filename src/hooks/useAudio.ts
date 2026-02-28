import { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

export function useAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    audioService.init();
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setEnabled(next);
  };

  return { soundEnabled, toggleSound };
}
