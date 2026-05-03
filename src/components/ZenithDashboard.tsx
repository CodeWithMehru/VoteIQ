'use client';

import React, { useState,   } from 'react';

type DashboardTab = 'ledger' | 'comparison';

interface BlockchainBlock {
  readonly i: number;
  readonly hash: string;
}

/**
 * Zenith Civic Education Dashboard (Problem Statement Nodes 1, 13)
 * Provides interactive visualizations for vote integrity and global comparisons.
 */
export default function ZenithDashboard(): React.ReactNode {
  const [activeTab, setActiveTab] = useState<DashboardTab>('ledger');

  const BLOCKS: readonly BlockchainBlock[] = [1, 2, 3].map((i: number): BlockchainBlock => ({
    i,
    hash: `${Math.random().toString(36).substring(2, 15).toUpperCase()}...`
  })) satisfies readonly BlockchainBlock[];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={(): void => setActiveTab('ledger')}
          className={`pb-4 px-2 font-bold text-sm transition-colors ${activeTab === 'ledger' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Blockchain Integrity Ledger
        </button>
        <button
          onClick={(): void => setActiveTab('comparison')}
          className={`pb-4 px-2 font-bold text-sm transition-colors ${activeTab === 'comparison' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Global Tech Comparison
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div className="animate-in fade-in duration-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Live VVPAT Hash Chain</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Visualizing the cryptographic link between your vote and the immutable election record.
          </p>
          <div className="flex flex-col space-y-4">
            {BLOCKS.map((block: BlockchainBlock): React.ReactNode => (
              <div key={block.i} className="flex items-center space-x-4 relative">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-mono text-xs">
                  #0{block.i}
                </div>
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Block Hash</div>
                  <div className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
                    {block.hash}
                  </div>
                </div>
                {block.i < 3 && <div className="absolute left-[1.5rem] top-12 w-0.5 h-4 bg-blue-200 dark:bg-blue-800 z-10"></div>}
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            <strong>Zenith Security Node 1:</strong> Every block contains the hash of the previous block, creating an
            unbreakable "chain of trust" that prevents retroactive tampering.
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estonian i-Voting vs. VoteIQ</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="font-bold text-sm mb-2">Estonian Model</div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <li>• ID-Card based auth</li>
                <li>• Periodic re-voting allowed</li>
                <li>• Digital-only VVPAT</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="font-bold text-sm mb-2 text-blue-800 dark:text-blue-300">VoteIQ Zenith</div>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-2">
                <li>• Zero-Trust Anonymization</li>
                <li>• Real-time Hash receipts</li>
                <li>• Atomic VVPAT locking</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-500 italic">
            Problem Statement Node 13: Education on global standards ensures public trust in digital systems.
          </p>
        </div>
      )}
    </div>
  );
}
