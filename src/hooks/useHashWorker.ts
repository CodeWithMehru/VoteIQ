import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useHashWorker (Efficiency Node 10)
 * Manages the lifecycle of the VVPAT Hashing Web Worker.
 */
export function useHashWorker(): { generateVVPAT: (data: string, visitorId: string) => Promise<{ hash: string; fullHash: string }>; isHashing: boolean } {
  const workerRef = useRef<Worker | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/hash.worker.ts', import.meta.url));
    return (): void => workerRef.current?.terminate();
  }, []);

  const generateVVPAT = useCallback((data: string, visitorId: string): Promise<{ hash: string; fullHash: string }> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) return reject('Worker not initialized');

      setIsHashing(true);
      workerRef.current.onmessage = (e: MessageEvent): void => {
        setIsHashing(false);
        if (e.data.error) reject(e.data.error);
        else resolve(e.data);
      };

      workerRef.current.postMessage({ data, visitorId });
    });
  }, []);

  return { generateVVPAT, isHashing };
}
