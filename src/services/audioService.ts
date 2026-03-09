class AudioService {
  private moveSound: HTMLAudioElement | null = null;
  private captureSound: HTMLAudioElement | null = null;
  private ttsAudio: HTMLAudioElement | null = null;
  private enabled = true;

  init() {
    this.moveSound = new Audio('/sounds/move.wav');
    this.captureSound = new Audio('/sounds/capture.wav');
    this.ttsAudio = new Audio();
    this.moveSound.load();
    this.captureSound.load();
  }

  /** Unlock TTS audio element on iOS/iPadOS. Must be called during a user gesture. */
  unlock() {
    // Playing on an HTMLAudioElement during a user gesture "unlocks" it on iOS,
    // allowing subsequent play() calls from non-gesture contexts (e.g. SignalR callbacks).
    if (this.ttsAudio) {
      this.ttsAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
      this.ttsAudio.play().catch(() => {});
    }
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
    if (!this.ttsAudio) return;
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      this.ttsAudio.onended = () => URL.revokeObjectURL(url);
      this.ttsAudio.src = url;
      this.ttsAudio.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }
  }
}

export const audioService = new AudioService();
