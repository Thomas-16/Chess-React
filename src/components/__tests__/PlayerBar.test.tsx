import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerBar } from '../board/PlayerBar';

describe('PlayerBar', () => {
  it('renders player name', () => {
    render(<PlayerBar name="You" />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('renders first letter as initial', () => {
    render(<PlayerBar name="Opponent" />);
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('renders initial for "You" player', () => {
    render(<PlayerBar name="You" />);
    expect(screen.getByText('Y')).toBeInTheDocument();
  });
});
