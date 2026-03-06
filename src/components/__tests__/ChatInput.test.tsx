import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../chat/ChatInput';

// Mock useVoiceInput since it depends on browser APIs
vi.mock('../../hooks/useVoiceInput', () => ({
  useVoiceInput: () => ({
    isRecording: false,
    volume: 0,
    duration: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(() => Promise.resolve(null)),
  }),
}));

describe('ChatInput', () => {
  it('renders input field', () => {
    render(<ChatInput onSend={vi.fn()} hasGame={true} />);
    expect(screen.getByPlaceholderText('Talk about the position...')).toBeInTheDocument();
  });

  it('shows different placeholder when no game', () => {
    render(<ChatInput onSend={vi.fn()} hasGame={false} />);
    expect(screen.getByPlaceholderText('Start a game to chat')).toBeInTheDocument();
  });

  it('Send button calls onSend with text', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} hasGame={true} />);

    const input = screen.getByPlaceholderText('Talk about the position...');
    await user.type(input, 'test message');
    await user.click(screen.getByText('Send'));

    expect(onSend).toHaveBeenCalledWith('test message');
  });

  it('Enter key submits the message', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} hasGame={true} />);

    const input = screen.getByPlaceholderText('Talk about the position...');
    await user.type(input, 'hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('does not send empty messages', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} hasGame={true} />);

    const input = screen.getByPlaceholderText('Talk about the position...');
    await user.type(input, '{Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('input is disabled when disabled prop is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled hasGame={true} />);
    const input = screen.getByPlaceholderText('Talk about the position...');
    expect(input).toBeDisabled();
  });

  it('input is disabled when hasGame is false', () => {
    render(<ChatInput onSend={vi.fn()} hasGame={false} />);
    const input = screen.getByPlaceholderText('Start a game to chat');
    expect(input).toBeDisabled();
  });

  it('enforces character limit of 200', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} hasGame={true} />);

    const input = screen.getByPlaceholderText('Talk about the position...') as HTMLInputElement;
    const longText = 'a'.repeat(250);

    // fireEvent.change is simpler for long text
    fireEvent.change(input, { target: { value: longText } });

    expect(input.value.length).toBeLessThanOrEqual(200);
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} hasGame={true} />);

    const input = screen.getByPlaceholderText('Talk about the position...') as HTMLInputElement;
    await user.type(input, 'message');
    await user.click(screen.getByText('Send'));

    expect(input.value).toBe('');
  });
});
