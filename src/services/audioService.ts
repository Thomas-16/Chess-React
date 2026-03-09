class AudioService {
  private moveSound: HTMLAudioElement | null = null;
  private captureSound: HTMLAudioElement | null = null;
  private enabled = true;
  private audioContext: AudioContext | null = null;

  init() {
    this.moveSound = new Audio('/sounds/move.wav');
    this.captureSound = new Audio('/sounds/capture.wav');
    this.moveSound.load();
    this.captureSound.load();
  }

  /** Create or resume the AudioContext. Must be called during a user gesture on iOS/iPadOS. */
  unlock() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
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
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const arrayBuffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      );

      this.audioContext.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          if (!this.audioContext) return;
          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(this.audioContext.destination);
          source.start(0);
        },
        () => {
          // Decode error — ignore
        }
      );
    } catch {
      // Ignore audio errors
    }
  }
}

export const audioService = new AudioService();
