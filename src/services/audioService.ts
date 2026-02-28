class AudioService {
  private moveSound: HTMLAudioElement | null = null;
  private captureSound: HTMLAudioElement | null = null;
  private enabled = true;

  init() {
    this.moveSound = new Audio('/sounds/move.wav');
    this.captureSound = new Audio('/sounds/capture.wav');
    this.moveSound.load();
    this.captureSound.load();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playMove() {
    if (!this.enabled || !this.moveSound) return;
    this.moveSound.currentTime = 0;
    this.moveSound.play().catch(() => {});
  }

  playCapture() {
    if (!this.enabled || !this.captureSound) return;
    this.captureSound.currentTime = 0;
    this.captureSound.play().catch(() => {});
  }

  playBase64Audio(base64: string) {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }
  }
}

export const audioService = new AudioService();
