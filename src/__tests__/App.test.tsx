import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock all services
vi.mock('../services/stockfishService', () => ({
  stockfishService: {
    init: vi.fn(() => Promise.resolve()),
    getBestMove: vi.fn(() => Promise.resolve('e2e4')),
    terminate: vi.fn(),
  },
}));

vi.mock('../services/signalRService', () => ({
  signalRService: {
    connect: vi.fn((_a: unknown, _b: unknown, _c: unknown, onStatus: (c: boolean) => void) => {
      onStatus(true);
      return Promise.resolve();
    }),
    disconnect: vi.fn(),
    startNewGame: vi.fn(() => Promise.resolve('game-123')),
    sendChatMessage: vi.fn(() => Promise.resolve()),
    saveGameResult: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../services/audioService', () => ({
  audioService: {
    init: vi.fn(),
    setEnabled: vi.fn(),
    playMove: vi.fn(),
    playCapture: vi.fn(),
    playBase64Audio: vi.fn(),
  },
}));

// Mock react-chessboard since it uses canvas/complex DOM
vi.mock('react-chessboard', () => ({
  Chessboard: (props: Record<string, unknown>) => (
    <div data-testid="chessboard" data-fen={props.position as string}>
      Mock Chessboard
    </div>
  ),
}));

// Mock VoiceButton to avoid MediaRecorder issues
vi.mock('../hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    isRecording: false,
    volume: 0,
    duration: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(() => Promise.resolve(null)),
  }),
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  it('shows difficulty popup on idle state', async () => {
    render(<App />);
    expect(screen.getByText('Select difficulty')).toBeInTheDocument();
    // Wait for stockfish to become ready
    await waitFor(() => {
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });
  });

  it('shows player bars', () => {
    render(<App />);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText(/^AI \(Medium\)$/)).toBeInTheDocument();
  });

  it('shows control panel with status indicators', async () => {
    render(<App />);
    // Wait for stockfish ready state to propagate
    await waitFor(() => {
      expect(screen.getByText('Engine ready')).toBeInTheDocument();
    });
    expect(screen.getByText('Online')).toBeInTheDocument();
  });
});
