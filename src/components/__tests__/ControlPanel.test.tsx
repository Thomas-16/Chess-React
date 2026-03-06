import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../menu/ControlPanel';

const defaultProps = {
  difficulty: 'Easy' as const,
  onDifficultyChange: vi.fn(),
  onNewGame: vi.fn(),
  onReturnToIdle: vi.fn(),
  soundEnabled: true,
  onToggleSound: vi.fn(),
  connected: true,
  stockfishReady: true,
  isPlaying: false,
};

describe('ControlPanel', () => {
  it('shows Engine ready when stockfish is ready', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText('Engine ready')).toBeInTheDocument();
  });

  it('shows Loading when stockfish not ready', () => {
    render(<ControlPanel {...defaultProps} stockfishReady={false} />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('shows Online when connected', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows Offline when not connected', () => {
    render(<ControlPanel {...defaultProps} connected={false} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders all 4 difficulty buttons', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('clicking difficulty calls onDifficultyChange', () => {
    const onDifficultyChange = vi.fn();
    render(<ControlPanel {...defaultProps} onDifficultyChange={onDifficultyChange} />);

    fireEvent.click(screen.getByText('Medium'));
    expect(onDifficultyChange).toHaveBeenCalledWith('Medium');
  });

  it('shows New Game button when not playing', () => {
    const onNewGame = vi.fn();
    render(<ControlPanel {...defaultProps} onNewGame={onNewGame} />);

    fireEvent.click(screen.getByText('New Game'));
    expect(onNewGame).toHaveBeenCalledOnce();
  });

  it('shows New Game (resign) button when playing', () => {
    const onReturnToIdle = vi.fn();
    render(<ControlPanel {...defaultProps} isPlaying={true} onReturnToIdle={onReturnToIdle} />);

    fireEvent.click(screen.getByText('New Game'));
    expect(onReturnToIdle).toHaveBeenCalledOnce();
  });

  it('sound toggle calls onToggleSound', () => {
    const onToggleSound = vi.fn();
    render(<ControlPanel {...defaultProps} onToggleSound={onToggleSound} />);

    fireEvent.click(screen.getByTitle('Mute sounds'));
    expect(onToggleSound).toHaveBeenCalledOnce();
  });

  it('shows muted icon when sound disabled', () => {
    render(<ControlPanel {...defaultProps} soundEnabled={false} />);
    expect(screen.getByTitle('Enable sounds')).toBeInTheDocument();
  });

  it('difficulty buttons are disabled when playing', () => {
    render(<ControlPanel {...defaultProps} isPlaying={true} />);

    // The difficulty buttons should be disabled
    const easyBtn = screen.getByText('Easy');
    expect(easyBtn).toBeDisabled();
  });
});
