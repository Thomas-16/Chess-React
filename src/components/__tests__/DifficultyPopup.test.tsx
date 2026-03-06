import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultyPopup } from '../menu/DifficultyPopup';

describe('DifficultyPopup', () => {
  const defaultProps = {
    open: true,
    difficulty: 'Easy' as const,
    onDifficultyChange: vi.fn(),
    onStart: vi.fn(),
    stockfishReady: true,
  };

  it('renders nothing when not open', () => {
    const { container } = render(<DifficultyPopup {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders difficulty descriptions when open', () => {
    render(<DifficultyPopup {...defaultProps} />);

    expect(screen.getByText('Beginner friendly')).toBeInTheDocument();
    expect(screen.getByText('Casual challenge')).toBeInTheDocument();
    expect(screen.getByText('Competitive play')).toBeInTheDocument();
    expect(screen.getByText('Maximum strength')).toBeInTheDocument();
  });

  it('clicking a difficulty calls onDifficultyChange', () => {
    const onDifficultyChange = vi.fn();
    render(<DifficultyPopup {...defaultProps} onDifficultyChange={onDifficultyChange} />);

    fireEvent.click(screen.getByText('Hard'));
    expect(onDifficultyChange).toHaveBeenCalledWith('Hard');
  });

  it('Start Game button calls onStart', () => {
    const onStart = vi.fn();
    render(<DifficultyPopup {...defaultProps} onStart={onStart} />);

    fireEvent.click(screen.getByText('Start Game'));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('Start Game button is disabled when stockfish not ready', () => {
    render(<DifficultyPopup {...defaultProps} stockfishReady={false} />);

    expect(screen.getByText('Loading engine…')).toBeInTheDocument();
    expect(screen.getByText('Loading engine…')).toBeDisabled();
  });
});
