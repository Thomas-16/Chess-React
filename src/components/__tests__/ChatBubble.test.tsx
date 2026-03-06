import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatBubble } from '../chat/ChatBubble';
import type { ChatMessage } from '../../types/chat';

describe('ChatBubble', () => {
  it('renders user message text', () => {
    const msg: ChatMessage = {
      id: '1',
      speaker: 'user',
      text: 'Hello there!',
      timestamp: new Date(),
    };
    render(<ChatBubble message={msg} />);
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('renders AI message text', () => {
    const msg: ChatMessage = {
      id: '2',
      speaker: 'ai',
      text: 'Good move!',
      timestamp: new Date(),
      isTyping: false,
    };
    render(<ChatBubble message={msg} />);
    expect(screen.getByText('Good move!')).toBeInTheDocument();
  });

  it('shows partial text when AI is typing', () => {
    const msg: ChatMessage = {
      id: '3',
      speaker: 'ai',
      text: 'Hello World!',
      timestamp: new Date(),
      isTyping: true,
      visibleChars: 5,
    };
    render(<ChatBubble message={msg} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('Hello World!')).not.toBeInTheDocument();
  });

  it('shows blinking cursor when AI is typing', () => {
    const msg: ChatMessage = {
      id: '4',
      speaker: 'ai',
      text: 'Thinking...',
      timestamp: new Date(),
      isTyping: true,
      visibleChars: 3,
    };
    render(<ChatBubble message={msg} />);
    expect(screen.getByText('▋')).toBeInTheDocument();
  });

  it('does not show cursor when typing is complete', () => {
    const msg: ChatMessage = {
      id: '5',
      speaker: 'ai',
      text: 'Done',
      timestamp: new Date(),
      isTyping: false,
    };
    render(<ChatBubble message={msg} />);
    expect(screen.queryByText('▋')).not.toBeInTheDocument();
  });
});
