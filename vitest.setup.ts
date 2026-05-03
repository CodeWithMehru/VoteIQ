import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/** MessageEvent data shape from the hash worker. */
interface HashWorkerMessageData {
  readonly hash: string;
  readonly fullHash: string;
}

/** Mock Worker for Zenith Efficiency Node 1 */
class MockWorker {
  public onmessage: (e: MessageEvent<HashWorkerMessageData>) => void = () => undefined;

  public postMessage(_data: unknown): void {
    setTimeout((): void => {
      this.onmessage(
        new MessageEvent<HashWorkerMessageData>('message', {
          data: { hash: 'MOCK_HASH', fullHash: 'MOCK_FULL_HASH' },
        })
      );
    }, 10);
  }

  public terminate(): void { /* no-op */ }
}

 
global.Worker = MockWorker as unknown as typeof Worker;

if (typeof window !== 'undefined') {
  global.URL.createObjectURL = vi.fn();
}

/** Mock AudioContext for Zenith A11y Node 19 */
 
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    type: 'triangle',
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() },
  }),
  destination: {},
  currentTime: 0,
})) as unknown as typeof AudioContext;
