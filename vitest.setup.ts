import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Worker for Zenith Efficiency Node 1
class MockWorker {
  onmessage: (e: any) => void = () => {};
  postMessage(data: any) {
    setTimeout(() => {
      this.onmessage({ data: { hash: 'MOCK_HASH', fullHash: 'MOCK_FULL_HASH' } });
    }, 10);
  }
  terminate() {}
}

global.Worker = MockWorker as any;

if (typeof window !== 'undefined') {
  global.URL.createObjectURL = vi.fn();
}

// Mock AudioContext for Zenith A11y Node 19
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  }),
  destination: {},
  currentTime: 0
})) as any;
