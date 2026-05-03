'use client';

import { useState } from 'react';

/**
 * Zenith Gerrymandering Sandbox (Problem Statement Node 2)
 * Interactive simulation showing how boundary manipulation affects voter outcomes.
 */
export default function ZenithGerrymandering() {
  const [districts, setDistricts] = useState([
    { id: 1, partyA: 60, partyB: 40, size: 'w-1/2' },
    { id: 2, partyA: 40, partyB: 60, size: 'w-1/2' },
  ]);

  const toggleLayout = () => {
    // Mock redistribution of boundaries
    setDistricts([
      { id: 1, partyA: 80, partyB: 20, size: 'w-1/4' },
      { id: 2, partyA: 45, partyB: 55, size: 'w-3/4' },
    ]);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Constituency Sandbox</h3>
        <button 
          onClick={toggleLayout}
          className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all"
        >
          Redistribute Boundaries
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Gerrymandering is the practice of setting boundaries for electoral districts to favor one party over another.
      </p>

      <div className="flex space-x-2 h-24 mb-6">
        {districts.map((d) => (
          <div key={d.id} className={`${d.size} h-full rounded-xl overflow-hidden flex shadow-inner`}>
            <div className="bg-blue-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${d.partyA}%` }}>
              {d.partyA}%
            </div>
            <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${d.partyB}%` }}>
              {d.partyB}%
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">
        <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Party A Control</div>
        <div className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Party B Control</div>
      </div>
      
      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-xs text-indigo-800 dark:text-indigo-300">
        <strong>Problem Statement Node 2:</strong> In this mock simulation, observe how changing the "Size" and "Weight" of a district can turn a close race into a landslide victory without changing a single vote.
      </div>
    </div>
  );
}
