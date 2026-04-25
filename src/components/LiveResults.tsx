'use client';

import { useVotes } from '@/hooks/useVotes';

export default function LiveResults() {
  const { tally, loading } = useVotes();

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(tally.partyA, tally.partyB, tally.partyC, 1); // Avoid div by 0

  const getPercentage = (votes: number) => {
    return tally.total === 0 ? 0 : Math.round((votes / tally.total) * 100);
  };

  const getWidth = (votes: number) => {
    return `${(votes / maxVotes) * 100}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Mock Results</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time simulation analytics</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{tally.total}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Votes</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Party A */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Party A</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tally.partyA} votes ({getPercentage(tally.partyA)}%)</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getWidth(tally.partyA) }}
              role="progressbar"
              aria-valuenow={getPercentage(tally.partyA)}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>

        {/* Party B */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Party B</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tally.partyB} votes ({getPercentage(tally.partyB)}%)</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getWidth(tally.partyB) }}
              role="progressbar"
              aria-valuenow={getPercentage(tally.partyB)}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>

        {/* Party C */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Party C</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tally.partyC} votes ({getPercentage(tally.partyC)}%)</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getWidth(tally.partyC) }}
              role="progressbar"
              aria-valuenow={getPercentage(tally.partyC)}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-center">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live connection via Firestore
        </div>
      </div>
    </div>
  );
}
