'use client';

/**
 * Zenith Threat Model (Problem Statement Node 6)
 * Guided explainer showing how the platform prevents common electoral fraud.
 */
export default function ZenithThreatModel(): React.JSX.Element {
  const layers = [
    { name: 'Anonymous Session', status: 'Active', desc: 'Prevents identity tracking via Zero-Knowledge proofs.' },
    { name: 'Atomic Firestore Lock', status: 'Active', desc: 'Blocks double-voting at the database transaction level.' },
    { name: 'Edge Rate Limiting', status: 'Active', desc: 'Token-bucket algorithms stop automated bot-nets.' },
    { name: 'Cryptographic VVPAT', status: 'Active', desc: 'Signed receipts ensure vote auditability.' },
  ];

  return (
    <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-2xl border border-gray-800">
      <h3 className="text-xl font-bold mb-2 flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-2"></span>
        Zenith Defense Model
      </h3>
      <p className="text-sm text-gray-400 mb-8">How we protect the integrity of the mock election.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {layers.map((l) => (
          <div key={l.name} className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-xs text-blue-400">{l.name}</div>
              <div className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono">SECURED</div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{l.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest">
        <span>Military Grade Encryption</span>
        <span>•</span>
        <span>Zero Trust Identity</span>
        <span>•</span>
        <span>Edge Protection</span>
      </div>
    </div>
  );
}
