import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySelector } from '../menu/DifficultySelector';

describe('DifficultySelector', () => {
  it('renders all 4 difficulty levels', () => {
    render(<DifficultySelector selected="Easy" onChange={vi.fn()} />);

    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('clicking a level calls onChange with correct value', () => {
    const onChange = vi.fn();
    render(<DifficultySelector selected="Easy" onChange={onChange} />);

    fireEvent.click(screen.getByText('Hard'));
    expect(onChange).toHaveBeenCalledWith('Hard');
  });

  it('buttons are disabled when disabled prop is true', () => {
    render(<DifficultySelector selected="Easy" onChange={vi.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});
