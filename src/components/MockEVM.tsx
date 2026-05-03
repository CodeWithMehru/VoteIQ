'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useHashWorker } from '@/hooks/useHashWorker';
import { CandidateID, VotingCandidate, Result, toCandidateID, toVisitorID, toVoterID } from '@/lib';

const CANDIDATES: readonly VotingCandidate[] = [
  { id: toCandidateID('partyA'), name: 'Party A', symbol: '🟦' },
  { id: toCandidateID('partyB'), name: 'Party B', symbol: '🟩' },
  { id: toCandidateID('partyC'), name: 'Party C', symbol: '🟧' },
] as const satisfies readonly VotingCandidate[];

/**
 * Singularity Architecture: Candidate Row Component
 */
const CandidateRow = React.memo(({ 
  c, 
  isSubmitting, 
  onVote, 
  isFocused 
}: { 
  readonly c: VotingCandidate; 
  readonly isSubmitting: boolean; 
  readonly onVote: (id: CandidateID) => Promise<void>; 
  readonly isFocused: boolean; 
}): React.ReactNode => {
  return (
    <button
      onClick={(): Promise<void> => onVote(c.id)}
      disabled={isSubmitting}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
        isFocused
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } hover:border-blue-400 disabled:opacity-50 group`}
      aria-label={`Vote for ${c.name}`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{c.symbol}</span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">{c.name}</span>
      </div>
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-blue-500 transition-colors">
        {isFocused && <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse" />}
      </div>
    </button>
  );
});
CandidateRow.displayName = 'CandidateRow';

export default function MockEVM(): React.ReactNode {
  useAuth(); // Just initialize
  const { generateVVPAT } = useHashWorker();
  const { strings } = useLanguage();
  
  const [step, setStep] = React.useState<'id' | 'vote' | 'success'>('id');
  const [voterId, setVoterId] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [focusedCandidateIndex, setFocusedCandidateIndex] = React.useState<number>(0);
  const [vvpatHash, setVvpatHash] = React.useState<string | null>(null);

  const handleNext = (): void => {
    if (voterId.trim().length >= 6) {
      setStep('vote');
    }
  };

  const handleVote = async (id: CandidateID): Promise<void> => {
    setIsSubmitting(true);
    try {
      const hashObj = await generateVVPAT(toVoterID(voterId), id);
      setVvpatHash(hashObj.hash);

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: toVoterID(voterId),
          candidateId: id,
          visitorId: toVisitorID('MOCK_VISITOR'),
          hash: hashObj.hash,
        }),
      });

      const data: Result<unknown> = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        alert('Voting failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: unknown) {
      console.error(err);
      alert('Network error during voting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (step !== 'vote') return;
    
    if (e.key === 'ArrowDown') {
      setFocusedCandidateIndex((prev) => (prev + 1) % CANDIDATES.length);
    } else if (e.key === 'ArrowUp') {
      setFocusedCandidateIndex((prev) => (prev - 1 + CANDIDATES.length) % CANDIDATES.length);
    } else if (e.key === 'Enter') {
      const candidate = CANDIDATES[focusedCandidateIndex];
      if (candidate) {
        void handleVote(candidate.id);
      }
    }
  };

  return (
    <div 
      className="max-w-md mx-auto p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border-4 border-gray-200 dark:border-gray-800 shadow-2xl relative overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500" />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {strings.simulator_title}
        </h2>
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" title="Secure Link Active" />
      </div>

      <div className="min-h-[300px] flex flex-col justify-center">
        {step === 'id' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label htmlFor="voter-id-input" className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                {strings.voter_id}
              </label>
              <input
                id="voter-id-input"
                type="text"
                value={voterId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setVoterId(e.target.value.toUpperCase())}
                placeholder="ABC12345"
                className="w-full text-3xl font-mono p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-colors"
                maxLength={10}
              />
            </div>
            <button
              onClick={handleNext}
              disabled={voterId.trim().length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black py-4 rounded-xl transition-all shadow-xl disabled:opacity-50"
            >
              {strings.verify_proceed}
            </button>
          </div>
        )}

        {step === 'vote' && (
          <div className="space-y-3" role="group" aria-label="Candidate Selection">
            {CANDIDATES.map((c: VotingCandidate, idx: number): React.ReactNode => (
              <CandidateRow key={c.id} c={c} isSubmitting={isSubmitting} onVote={handleVote} isFocused={idx === focusedCandidateIndex} />
            ))}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{strings.vote_cast_success}</h3>
            <p className="text-gray-600 dark:text-gray-400">{strings.duty_complete}</p>
            
            {vvpatHash && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">VVPAT Digital Signature (WASM-Secure)</p>
                <code className="text-[10px] break-all text-emerald-600 dark:text-emerald-400 font-mono">
                  {vvpatHash}
                </code>
              </div>
            )}

            <button
              onClick={(): void => {
                setStep('id');
                setVoterId('');
                setVvpatHash(null);
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Finish Session
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        <span>ZENITH-X12 SECURE MODULE</span>
        <span className="flex items-center">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
          ENCRYPTED
        </span>
      </div>
    </div>
  );
}
