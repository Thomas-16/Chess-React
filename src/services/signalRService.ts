import * as signalR from '@microsoft/signalr';
import { HUB_URL } from '../constants/game';
import type { ChessPositionContext } from '../types/chat';

type ChatResponsePayload = {
  gameId: string;
  message: string;
  audio: string;
  timestamp: string;
};

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private _isConnected = false;
  private _isConnecting = false;

  get isConnected() { return this._isConnected; }
  get isConnecting() { return this._isConnecting; }

  async connect(
    onChatResponse: (payload: ChatResponsePayload) => void,
    onChatError: (msg: string) => void,
    onGameSaved: (gameId: string) => void,
    onStatusChange: (connected: boolean) => void,
  ) {
    if (this._isConnected) return;

    // If a previous attempt was aborted (e.g. React StrictMode unmount),
    // clean up the old connection so we can start fresh.
    if (this.connection) {
      try { await this.connection.stop(); } catch { /* ignore */ }
      this.connection = null;
    }

    this._isConnecting = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        withCredentials: false,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    this.connection = connection;

    // Register handlers BEFORE starting
    connection.on('ReceiveChatResponse', onChatResponse);
    connection.on('ChatError', onChatError);
    connection.on('GameSaved', onGameSaved);
    connection.on('SaveError', (msg: string) => console.error('SaveError:', msg));

    connection.onreconnecting(() => {
      this._isConnected = false;
      this._isConnecting = true;
      onStatusChange(false);
    });

    connection.onreconnected(() => {
      this._isConnected = true;
      this._isConnecting = false;
      onStatusChange(true);
    });

    connection.onclose(() => {
      this._isConnected = false;
      this._isConnecting = false;
      onStatusChange(false);
    });

    try {
      await connection.start();
      // Check if disconnect() was called while we were awaiting start()
      if (this.connection !== connection) {
        // This connection was superseded; stop it and bail out
        try { await connection.stop(); } catch { /* ignore */ }
        return;
      }
      this._isConnected = true;
      this._isConnecting = false;
      onStatusChange(true);
    } catch (err) {
      this._isConnected = false;
      this._isConnecting = false;
      // Only log if it's not an expected abort from disconnect()
      if (this.connection === connection) {
        console.error('SignalR connection failed:', err);
      }
    }
  }

  async startNewGame(): Promise<string | null> {
    if (!this._isConnected || !this.connection) return null;
    try {
      const gameId = await this.connection.invoke<string>('StartNewGame');
      return gameId;
    } catch (err) {
      console.error('StartNewGame failed:', err);
      return null;
    }
  }

  async sendChatMessage(gameId: string, message: string, context: ChessPositionContext | null) {
    if (!this._isConnected || !this.connection) return;
    try {
      await this.connection.invoke('SendChatMessage', gameId, message, context);
    } catch (err) {
      console.error('SendChatMessage failed:', err);
    }
  }

  async saveGameResult(gameId: string, pgn: string, result: string) {
    if (!this._isConnected || !this.connection) return;
    try {
      await this.connection.invoke('SaveGameResult', gameId, pgn, result);
    } catch (err) {
      console.error('SaveGameResult failed:', err);
    }
  }

  async disconnect() {
    this._isConnecting = false;
    this._isConnected = false;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Ignore errors during disconnect
      }
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
export type { ChatResponsePayload };
