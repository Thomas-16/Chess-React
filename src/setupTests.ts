import '@testing-library/jest-dom/vitest';

// Mock Worker (used by Stockfish)
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn(() => true);
  onerror = null;
  onmessageerror = null;
}
vi.stubGlobal('Worker', MockWorker);

// Mock Audio (used by audioService)
class MockAudio {
  src = '';
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  volume = 1;
}
vi.stubGlobal('Audio', MockAudio);

// Mock AudioContext for voice input
const mockAnalyser = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  fftSize: 0,
  frequencyBinCount: 128,
  getByteFrequencyData: vi.fn(),
};
const mockAudioContext = {
  createAnalyser: vi.fn(() => mockAnalyser),
  createMediaStreamSource: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
  close: vi.fn(),
};
vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  state = 'inactive';
  ondataavailable: ((e: unknown) => void) | null = null;
  onstop: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
vi.stubGlobal('MediaRecorder', MockMediaRecorder);

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
  writable: true,
});

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

// Mock URL.createObjectURL / revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}
