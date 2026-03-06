import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameResultOverlay } from '../board/GameResultOverlay';

describe('GameResultOverlay', () => {
  it('renders display text', () => {
    const result = { winner: 'white' as const, reason: 'checkmate', displayText: 'White wins by checkmate!' };
    render(<GameResultOverlay result={result} onReturnToIdle={vi.fn()} />);

    expect(screen.getByText('White wins by checkmate!')).toBeInTheDocument();
  });

  it('renders the reason', () => {
    const result = { winner: 'draw' as const, reason: 'stalemate', displayText: 'Draw by stalemate' };
    render(<GameResultOverlay result={result} onReturnToIdle={vi.fn()} />);

    expect(screen.getByText('stalemate')).toBeInTheDocument();
  });

  it('New Game button calls onReturnToIdle', () => {
    const onReturnToIdle = vi.fn();
    const result = { winner: 'black' as const, reason: 'checkmate', displayText: 'Black wins!' };
    render(<GameResultOverlay result={result} onReturnToIdle={onReturnToIdle} />);

    fireEvent.click(screen.getByText('New Game'));
    expect(onReturnToIdle).toHaveBeenCalledOnce();
  });
});
