'use client';

import { useState, useEffect, memo, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { APP_CONSTANTS } from '@/lib/domain/constants';
import { useHashWorker } from '@/hooks/useHashWorker';
import { CandidateID, VoterID, VisitorID, VotingCandidate, Result } from '@/lib/domain/types';
import { sanitizeInput, validateVoterId } from '@/lib/domain/logic';

/**
 * Step type for the multi-stage voting process.
 */
type Step = 'verify' | 'vote' | 'receipt';

/**
 * Static candidate data (Purity: Constant outside component).
 */
const CANDIDATES: ReadonlyArray<VotingCandidate> = [
  { id: 'partyA' as CandidateID, name: 'Candidate X', party: 'Party A', color: 'bg-blue-500', shape: 'square' },
  { id: 'partyB' as CandidateID, name: 'Candidate Y', party: 'Party B', color: 'bg-emerald-500', shape: 'circle' },
  { id: 'partyC' as CandidateID, name: 'Candidate Z', party: 'Party C', color: 'bg-amber-500', shape: 'triangle' },
];

/**
 * Individual candidate row component.
 * Node 3: Memoized with custom comparator.
 */
const CandidateRow = memo(
  ({
    c,
    isSubmitting,
    onVote,
    isFocused,
  }: {
    readonly c: VotingCandidate;
    readonly isSubmitting: boolean;
    readonly onVote: (id: CandidateID) => void;
    readonly isFocused: boolean;
  }): JSX.Element => {
    return (
      <button
        onClick={() => onVote(c.id)}
        disabled={isSubmitting}
        tabIndex={isFocused ? 0 : -1}
        className={`w-full text-left p-6 rounded-xl border-2 flex items-center justify-between transition-all duration-200 motion-safe:duration-500
        ${
          isSubmitting
            ? 'border-gray-300 bg-gray-200 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-not-allowed shadow-none'
            : 'border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-900 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/50'
        }`}
        aria-label={`Vote for ${c.name} of ${c.party}. ${c.shape} indicator.`}
      >
        <div className="flex items-center">
          <div className={`w-3 h-16 rounded-full ${c.color} mr-6 flex items-center justify-center`}>
            <span className="text-[8px] text-white font-bold opacity-0 group-hover:opacity-100">
              {c.shape[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900 dark:text-white flex items-center">
              {c.name}
              <span className="ml-2 text-[10px] uppercase px-1 border border-gray-300 dark:border-gray-700 rounded text-gray-400">
                {c.shape}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{c.party}</div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-gray-300' : 'bg-blue-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
          </div>
        </div>
      </button>
    );
  },
  (prev, next) => 
    prev.isSubmitting === next.isSubmitting && 
    prev.isFocused === next.isFocused && 
    prev.c.id === next.c.id
);
CandidateRow.displayName = 'CandidateRow';

/**
 * MockEVM: The core interactive voting terminal.
 * Refactored for Zenith Purity (Nodes 1, 2, 6, 9).
 */
export default function MockEVM(): JSX.Element {
  const { loginAnonymously, logout } = useAuth();
  const { generateVVPAT } = useHashWorker();
  const { strings } = useLanguage();
  
  const [step, setStep] = useState<Step>('verify');
  const [focusedCandidateIndex, setFocusedCandidateIndex] = useState(0);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [verificationHash, setVerificationHash] = useState<string | null>(null);
  const [isRCVMode, setIsRCVMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  /**
   * Handles voter identification and verification.
   * Node 2: Logic delegated to pure functions.
   */
  const handleVerify = (e: React.FormEvent): void => {
    e.preventDefault();
    const isIdValid = validateVoterId(idNumber);
    const isNameValid = name.length > 2;

    if (isIdValid && isNameValid) {
      setStep('vote');
    } else {
      setError(isIdValid ? 'Name is too short.' : 'Invalid Voter ID format (5-15 alphanumeric chars).');
    }
  };

  useEffect(() => {
    if (step === 'receipt') {
      const timer = setTimeout(() => {
        resetSimulator();
      }, APP_CONSTANTS.EVM_RESET_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
  }, [step]);

  /**
   * Resets the simulator to its initial state.
   */
  const resetSimulator = useCallback((): void => {
    setStep('verify');
    setName('');
    setIdNumber('');
    setReceipt(null);
    setVerificationHash(null);
    logout();
  }, [logout]);

  /**
   * Casts a ballot for a selected candidate.
   * Node 5: Standardized Result Pattern in API.
   * @param candidateId The ID of the chosen candidate.
   */
  const handleVote = async (candidateId: CandidateID): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const user = await loginAnonymously();
      if (!user) throw new Error('AUTH_FAILED');

      const { hash: vHash, fullHash: rcp } = await generateVVPAT(candidateId, user.uid);

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'mock-csrf-token-12345',
        },
        body: JSON.stringify({
          candidateId,
          visitorId: user.uid as VisitorID,
          voterId: idNumber as VoterID,
          name,
          receipt: rcp,
          verificationHash: vHash,
        }),
      });

      const result: Result<any> = await res.json();

      if (!result.success) {
        throw new Error(result.error.code || 'VOTE_FAILED');
      }

      setReceipt(rcp);
      setVerificationHash(vHash);
      setStep('receipt');
      playSuccessAudio();

    } catch (err: unknown) {
      const message = (err as Error).message;
      setError(message === 'ALREADY_VOTED' ? strings.already_voted_error : 'Failed to process ballot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Triggers the success audio cue.
   */
  const playSuccessAudio = (): void => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleVoteCallback = useCallback(
    (candidateId: CandidateID) => {
      handleVote(candidateId);
    },
    [idNumber, name, loginAnonymously, isSubmitting]
  );

  return (
    <div
      aria-describedby="voter-guide"
      className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row min-h-[500px]"
    >
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">{strings.simulator_desc}</p>
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

      <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center shadow-sm outline-none focus:ring-2 focus:ring-red-500"
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[15px] font-medium leading-snug">{error}</span>
            </div>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {strings.full_name}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(sanitizeInput(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {strings.voter_id}
                </label>
                <input
                  type="text"
                  id="idNumber"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="ABC1234567"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase().trim())}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-md shadow-blue-500/20"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {strings.digital_ballot}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{strings.select_candidate}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRCVMode(!isRCVMode)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${isRCVMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
                >
                  {isRCVMode ? 'RCV ACTIVE' : 'SWITCH TO RCV'}
                </button>
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                  {idNumber.toUpperCase()}
                </div>
              </div>
            </div>

            <div
              className="space-y-3"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  setFocusedCandidateIndex((prev) => (prev + 1) % CANDIDATES.length);
                } else if (e.key === 'ArrowUp') {
                  setFocusedCandidateIndex((prev) => (prev - 1 + CANDIDATES.length) % CANDIDATES.length);
                }
              }}
            >
              {CANDIDATES.map((c, idx) => (
                <CandidateRow
                  key={c.id}
                  c={c}
                  isSubmitting={isSubmitting}
                  onVote={handleVoteCallback}
                  isFocused={idx === focusedCandidateIndex}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'receipt' && (
          <div className="w-full max-w-md mx-auto text-center animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2" aria-live="polite">
              {strings.vote_cast_success}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{strings.duty_complete}</p>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                {strings.official_receipt}
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">{strings.voter_id}</span>
                <span className="font-mono text-gray-900 dark:text-white">{idNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">{strings.transaction}</span>
                <span className="font-mono text-xs text-gray-900 dark:text-white mt-1">{receipt}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-600 dark:text-gray-400">Verifiability Hash</span>
                <span className="font-mono text-xs text-green-600 dark:text-green-400 mt-1">{verificationHash}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 w-full flex items-center justify-center py-2 px-4 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              Print Official Receipt
            </button>
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
               <div className="p-2 bg-white rounded-lg">
                <QRCodeSVG value={verificationHash || ''} size={64} level="H" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
