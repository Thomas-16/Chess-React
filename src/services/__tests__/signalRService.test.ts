import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnection = {
  on: vi.fn(),
  start: vi.fn(() => Promise.resolve()),
  stop: vi.fn(() => Promise.resolve()),
  invoke: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  onclose: vi.fn(),
};

class MockHubConnectionBuilder {
  withUrl() { return this; }
  withAutomaticReconnect() { return this; }
  build() { return mockConnection; }
}

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: MockHubConnectionBuilder,
  HttpTransportType: { WebSockets: 1 },
}));

describe('signalRService', () => {
  let signalRService: typeof import('../signalRService').signalRService;

  beforeEach(async () => {
    vi.resetModules();
    mockConnection.on.mockClear();
    mockConnection.start.mockClear();
    mockConnection.stop.mockClear();
    mockConnection.invoke.mockClear();
    mockConnection.onreconnecting.mockClear();
    mockConnection.onreconnected.mockClear();
    mockConnection.onclose.mockClear();
    const mod = await import('../signalRService');
    signalRService = mod.signalRService;
  });

  it('connect registers handlers and starts connection', async () => {
    const onChat = vi.fn();
    const onError = vi.fn();
    const onSaved = vi.fn();
    const onStatus = vi.fn();

    await signalRService.connect(onChat, onError, onSaved, onStatus);

    // Should register handlers before starting
    expect(mockConnection.on).toHaveBeenCalledWith('ReceiveChatResponse', onChat);
    expect(mockConnection.on).toHaveBeenCalledWith('ChatError', onError);
    expect(mockConnection.on).toHaveBeenCalledWith('GameSaved', onSaved);
    expect(mockConnection.on).toHaveBeenCalledWith('SaveError', expect.any(Function));
    expect(mockConnection.start).toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith(true);
  });

  it('startNewGame invokes StartNewGame and returns gameId', async () => {
    const onChat = vi.fn();
    const onError = vi.fn();
    const onSaved = vi.fn();
    const onStatus = vi.fn();

    await signalRService.connect(onChat, onError, onSaved, onStatus);

    mockConnection.invoke.mockResolvedValueOnce('game-123');
    const gameId = await signalRService.startNewGame();
    expect(gameId).toBe('game-123');
    expect(mockConnection.invoke).toHaveBeenCalledWith('StartNewGame');
  });

  it('startNewGame returns null when not connected', async () => {
    const gameId = await signalRService.startNewGame();
    expect(gameId).toBeNull();
  });

  it('sendChatMessage invokes with correct args', async () => {
    await signalRService.connect(vi.fn(), vi.fn(), vi.fn(), vi.fn());

    await signalRService.sendChatMessage('game-1', 'hello', null);
    expect(mockConnection.invoke).toHaveBeenCalledWith('SendChatMessage', 'game-1', 'hello', null);
  });

  it('sendChatMessage does nothing when not connected', async () => {
    await signalRService.sendChatMessage('game-1', 'hello', null);
    expect(mockConnection.invoke).not.toHaveBeenCalled();
  });

  it('saveGameResult invokes with correct args', async () => {
    await signalRService.connect(vi.fn(), vi.fn(), vi.fn(), vi.fn());

    await signalRService.saveGameResult('game-1', 'pgn-data', '1-0');
    expect(mockConnection.invoke).toHaveBeenCalledWith('SaveGameResult', 'game-1', 'pgn-data', '1-0');
  });

  it('disconnect stops connection', async () => {
    await signalRService.connect(vi.fn(), vi.fn(), vi.fn(), vi.fn());

    await signalRService.disconnect();
    expect(mockConnection.stop).toHaveBeenCalled();
  });
});
