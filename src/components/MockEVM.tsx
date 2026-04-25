'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';

type Step = 'verify' | 'vote' | 'receipt';

const CANDIDATES = [
  { id: 'partyA', name: 'Candidate X', party: 'Party A', color: 'bg-blue-500' },
  { id: 'partyB', name: 'Candidate Y', party: 'Party B', color: 'bg-emerald-500' },
  { id: 'partyC', name: 'Candidate Z', party: 'Party C', color: 'bg-amber-500' },
];

export default function MockEVM() {
  const { loginAnonymously, logout } = useAuth();
  const { strings } = useLanguage();
  const [step, setStep] = useState<Step>('verify');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [verificationHash, setVerificationHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length > 2 && idNumber.length > 4) {
      setStep('vote');
    }
  };

  useEffect(() => {
    if (step === 'receipt') {
      const timer = setTimeout(() => {
        setStep('verify');
        setName('');
        setIdNumber('');
        setReceipt(null);
        setVerificationHash(null);
        logout();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, logout]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setStep('verify');
        setName('');
        setIdNumber('');
        setError(null);
        logout();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, logout]);

  const handleVote = async (candidateId: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create anonymous session to enforce 1 vote per browser
      const user = await loginAnonymously();
      
      if (!user) {
        throw new Error("Could not create voting session");
      }

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          visitorId: user.uid,
          voterId: idNumber,
          name: name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error === "ALREADY_VOTED" ? "Vote Claimed: This Voter ID has already cast a ballot!" : (data.error || 'Failed to cast vote'));
      }

      setReceipt(data.receipt);
      setVerificationHash(data.verificationHash);
      setStep('receipt');
      
      // Play beep sound for EVM simulation
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {
        // Ignore audio errors
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row min-h-[500px]">
      {/* Left panel - Info */}
      <div className="bg-gray-50 dark:bg-gray-950 md:w-1/3 p-8 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>{strings.simulator_badge}</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{strings.simulator_title}</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {strings.simulator_desc}
          </p>
        </div>
        
        <div className="mt-12 hidden md:block">
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{strings.secured_by}</span>
          </div>
        </div>
      </div>

      {/* Right panel - Interactive */}
      <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
        
        {error && (
          <div 
            aria-live="polite"
            className="absolute top-4 left-4 right-4 bg-red-50/90 dark:bg-red-900/30 backdrop-blur-md text-red-700 dark:text-red-400 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-800/50 flex items-start justify-between animate-in slide-in-from-top-2 duration-300 z-10"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[15px] font-medium leading-snug">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors ml-4 focus:outline-none"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{strings.id_verification}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{strings.id_desc}</p>
            </div>
            
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{strings.full_name}</label>
                <input
                  type="text"
                  id="name"
                  name="new-password"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{strings.voter_id}</label>
                <input
                  type="text"
                  id="idNumber"
                  name="new-password"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="ABC1234567"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-md shadow-blue-500/20"
                aria-label={strings.verify_proceed}
              >
                {strings.verify_proceed}
              </button>
            </form>
          </div>
        )}

        {step === 'vote' && (
          <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">{strings.digital_ballot}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{strings.select_candidate}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                {idNumber.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3">
              {CANDIDATES.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center p-2 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                >
                  <div className={`w-2 h-12 rounded-full ${c.color} mr-4`}></div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{c.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{c.party}</div>
                  </div>
                  <button
                    onClick={() => handleVote(c.id)}
                    disabled={isSubmitting}
                    className="ml-4 w-16 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                    aria-label={`Vote for ${c.name}`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'receipt' && (
          <div className="w-full max-w-md mx-auto text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2" aria-live="polite">{strings.vote_cast_success}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{strings.duty_complete}</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">{strings.official_receipt}</div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">{strings.voter_id}</span>
                <span className="font-mono text-gray-900 dark:text-white">{idNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">{strings.transaction}</span>
                <span className="font-mono text-xs text-gray-900 dark:text-white mt-1">{receipt}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">{strings.verifiability_hash}</span>
                <span className="font-mono text-xs text-green-600 dark:text-green-400 mt-1">{verificationHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{strings.time}</span>
                <span className="text-gray-900 dark:text-white">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="mt-8 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
              {strings.resetting}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
