import { useState, useEffect, useCallback } from 'react';
import { signalRService } from '../services/signalRService';
import type { ChatResponsePayload } from '../services/signalRService';

interface UseSignalRProps {
  onChatResponse: (payload: ChatResponsePayload) => void;
  onChatError: (msg: string) => void;
  onGameSaved: (gameId: string) => void;
}

export function useSignalR({ onChatResponse, onChatError, onGameSaved }: UseSignalRProps) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    signalRService.connect(
      onChatResponse,
      onChatError,
      onGameSaved,
      setConnected,
    );
    // Disconnect on unmount
    return () => { signalRService.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = useCallback(() => signalRService.startNewGame(), []);

  return { connected, startNewGame };
}
