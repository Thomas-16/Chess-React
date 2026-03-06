import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the StockfishService class with a mock Worker.
// Since stockfishService is a singleton, we re-import fresh each test.

let onmessageHandler: ((e: MessageEvent) => void) | null = null;
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();

vi.stubGlobal('Worker', class {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  postMessage = (...args: unknown[]) => {
    mockPostMessage(...args);
    // Store reference so tests can trigger onmessage
    onmessageHandler = this.onmessage;
  };
  terminate = mockTerminate;
});

describe('stockfishService', () => {
  let stockfishService: typeof import('../stockfishService').stockfishService;

  beforeEach(async () => {
    vi.resetModules();
    mockPostMessage.mockClear();
    mockTerminate.mockClear();
    onmessageHandler = null;
    const mod = await import('../stockfishService');
    stockfishService = mod.stockfishService;
  });

  it('init sends uci command and resolves on readyok', async () => {
    const initPromise = stockfishService.init();

    // Worker should have received 'uci'
    expect(mockPostMessage).toHaveBeenCalledWith('uci');

    // Simulate engine response
    onmessageHandler?.({ data: 'uciok' } as MessageEvent);
    // Should send 'isready'
    expect(mockPostMessage).toHaveBeenCalledWith('isready');

    onmessageHandler?.({ data: 'readyok' } as MessageEvent);
    await expect(initPromise).resolves.toBeUndefined();
  });

  it('getBestMove sends correct UCI commands for Easy difficulty', async () => {
    // Init first
    const initPromise = stockfishService.init();
    onmessageHandler?.({ data: 'uciok' } as MessageEvent);
    onmessageHandler?.({ data: 'readyok' } as MessageEvent);
    await initPromise;

    mockPostMessage.mockClear();

    const movePromise = stockfishService.getBestMove(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      'Easy',
      ['e2e4'],
    );

    expect(mockPostMessage).toHaveBeenCalledWith('ucinewgame');
    expect(mockPostMessage).toHaveBeenCalledWith('setoption name UCI_LimitStrength value false');
    expect(mockPostMessage).toHaveBeenCalledWith('setoption name Skill Level value 0');
    expect(mockPostMessage).toHaveBeenCalledWith('setoption name MultiPV value 6');
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('position fen'),
    );
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('go depth 4 movetime 300'),
    );

    // Simulate bestmove response
    onmessageHandler?.({ data: 'bestmove e7e5 ponder d2d4' } as MessageEvent);
    await expect(movePromise).resolves.toBe('e7e5');
  });

  it('getBestMove sends UCI_LimitStrength for Hard difficulty', async () => {
    const initPromise = stockfishService.init();
    onmessageHandler?.({ data: 'uciok' } as MessageEvent);
    onmessageHandler?.({ data: 'readyok' } as MessageEvent);
    await initPromise;

    mockPostMessage.mockClear();

    const movePromise = stockfishService.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'Hard',
      [],
    );

    expect(mockPostMessage).toHaveBeenCalledWith('setoption name UCI_LimitStrength value true');
    expect(mockPostMessage).toHaveBeenCalledWith('setoption name UCI_Elo value 1600');

    onmessageHandler?.({ data: 'bestmove e2e4 ponder e7e5' } as MessageEvent);
    await expect(movePromise).resolves.toBe('e2e4');
  });

  it('getBestMove rejects when not initialized', async () => {
    await expect(
      stockfishService.getBestMove('fen', 'Easy', []),
    ).rejects.toThrow('Stockfish not ready');
  });

  it('terminate stops the worker', async () => {
    const initPromise = stockfishService.init();
    onmessageHandler?.({ data: 'uciok' } as MessageEvent);
    onmessageHandler?.({ data: 'readyok' } as MessageEvent);
    await initPromise;

    stockfishService.terminate();
    expect(mockPostMessage).toHaveBeenCalledWith('quit');
    expect(mockTerminate).toHaveBeenCalled();
  });

  it('parses multipv info lines and selects blunder move for Easy', async () => {
    const initPromise = stockfishService.init();
    onmessageHandler?.({ data: 'uciok' } as MessageEvent);
    onmessageHandler?.({ data: 'readyok' } as MessageEvent);
    await initPromise;

    // Force blunder by mocking Math.random to return < blunderChance (0.70)
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const movePromise = stockfishService.getBestMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'Easy',
      [],
    );

    // Send multipv info lines
    onmessageHandler?.({ data: 'info depth 4 multipv 1 score cp 30 pv e2e4 e7e5' } as MessageEvent);
    onmessageHandler?.({ data: 'info depth 4 multipv 2 score cp 20 pv d2d4 d7d5' } as MessageEvent);
    onmessageHandler?.({ data: 'info depth 4 multipv 3 score cp 10 pv c2c4 e7e5' } as MessageEvent);

    onmessageHandler?.({ data: 'bestmove e2e4 ponder e7e5' } as MessageEvent);

    const move = await movePromise;
    // With blunder, it should pick a non-best move
    expect(['d2d4', 'c2c4']).toContain(move);

    vi.restoreAllMocks();
  });
});
