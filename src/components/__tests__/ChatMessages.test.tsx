import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessages } from '../chat/ChatMessages';
import type { ChatMessage } from '../../types/chat';

describe('ChatMessages', () => {
  it('shows placeholder when no messages', () => {
    render(<ChatMessages messages={[]} isWaiting={false} />);
    expect(screen.getByText('Ask about the position')).toBeInTheDocument();
  });

  it('renders list of messages', () => {
    const messages: ChatMessage[] = [
      { id: '1', speaker: 'user', text: 'What should I play?', timestamp: new Date() },
      { id: '2', speaker: 'ai', text: 'Try Nf3!', timestamp: new Date(), isTyping: false },
    ];
    render(<ChatMessages messages={messages} isWaiting={false} />);

    expect(screen.getByText('What should I play?')).toBeInTheDocument();
    expect(screen.getByText('Try Nf3!')).toBeInTheDocument();
  });

  it('shows thinking indicator when waiting', () => {
    render(<ChatMessages messages={[]} isWaiting={true} />);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
  });

  it('does not show thinking indicator when not waiting', () => {
    render(<ChatMessages messages={[]} isWaiting={false} />);
    expect(screen.queryByText('Thinking')).not.toBeInTheDocument();
  });

  it('hides placeholder when messages exist', () => {
    const messages: ChatMessage[] = [
      { id: '1', speaker: 'user', text: 'Hello', timestamp: new Date() },
    ];
    render(<ChatMessages messages={messages} isWaiting={false} />);
    expect(screen.queryByText('Ask about the position')).not.toBeInTheDocument();
  });
});
