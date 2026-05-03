'use client';

/**
 * Zenith Demographic Heatmap (Problem Statement Node 4)
 * Visualizes mock voter participation trends across constituencies.
 */
export default function ZenithHeatmap() {
  const regions = [
    { name: 'North District', turnout: 82, trend: '+4%', color: 'bg-blue-600' },
    { name: 'South District', turnout: 45, trend: '-2%', color: 'bg-blue-300' },
    { name: 'East District', turnout: 67, trend: '+1%', color: 'bg-blue-500' },
    { name: 'West District', turnout: 59, trend: '0%', color: 'bg-blue-400' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Regional Participation Heatmap</h3>
      <p className="text-sm text-gray-500 mb-8">Visualizing participation gaps to drive civic inclusion.</p>
      
      <div className="space-y-6">
        {regions.map((r) => (
          <div key={r.name} className="group">
            <div className="flex justify-between items-end mb-2">
              <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{r.name}</div>
              <div className="text-xs text-blue-600 font-mono">{r.turnout}% <span className="text-[10px] text-gray-400 ml-1">({r.trend})</span></div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
              <div 
                className={`${r.color} h-full rounded-full transition-all duration-1000 delay-300 group-hover:brightness-110`}
                style={{ width: `${r.turnout}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
          <div className="text-2xl font-black text-blue-600">63.2%</div>
          <div className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-tighter">Avg Turnout</div>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
          <div className="text-2xl font-black text-emerald-600">High</div>
          <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-tighter">Trust Rating</div>
        </div>
      </div>
    </div>
  );
}
