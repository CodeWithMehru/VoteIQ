'use client';

import { useState, useEffect, useRef } from 'react';
import { useVotes } from '@/hooks/useVotes';

/**
 * Singularity Hardened Live Results (Node 2: OffscreenCanvas)
 */
export default function LiveResults(): React.JSX.Element {
  const { tally, loading } = useVotes();
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker('/workers/chart-worker.js');
    
    // Transfer control to Offscreen
    if (canvasRef.current) {
      const offscreen = canvasRef.current.transferControlToOffscreen();
      workerRef.current.postMessage({ canvas: offscreen }, [offscreen]);
    }

    return (): void => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current && tally && !isPaused) {
      workerRef.current.postMessage({ tally });
    }
  }, [tally, isPaused]);

  if (loading) {
    return <div className="w-full h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Live Simulation Results</h2>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border-2 transition-colors ${isPaused ? 'bg-orange-100 text-orange-700 border-orange-500' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
          >
            {isPaused ? '▶ Resume Updates' : '⏸ Pause Updates'}
          </button>
        </div>
        <div className="text-right">
           <div className="text-3xl font-black text-blue-600">{tally.total}</div>
           <div className="text-xs uppercase text-gray-500">Total Ballots</div>
        </div>
      </div>

      {/* Node 2: OffscreenCanvas Container */}
      <div className="relative w-full h-[200px] bg-gray-50 dark:bg-gray-950 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={200} 
          className="w-full h-full"
        />
      </div>

      <div className="mt-8 text-xs text-gray-500 italic flex items-center">
        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Rendering offloaded to OffscreenCanvas Web Worker.
      </div>
    </div>
  );
}
