'use client';

import * as React from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useVotes } from '@/hooks/useVotes';
import { useLanguage } from '@/lib/i18n';

/**
 * Singularity Architecture: Officer Dashboard with Strict Types
 */
export default function DashboardPage(): React.ReactNode {
  useAuth();
  const { tally, castVotes } = useVotes();
  const { strings } = useLanguage();
  const [broadcastMessage, setBroadcastMessage] = React.useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = React.useState<boolean>(false);
  const [isResetting, setIsResetting] = React.useState<boolean>(false);

  const handleResetElection = async (): Promise<void> => {
    if (
      !window.confirm(
        'NUCLEAR RESET: Are you sure you want to permanently delete all vote records and reset all tallies to zero?'
      )
    )
      return;

    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-election', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      alert('Election data has been completely reset.');
      window.location.reload();
    } catch (_err: unknown) {
      alert('Error resetting election data.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    // In a real app, this would write to Firestore /system_alerts
    // For this mock, we just simulate the delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setBroadcastMessage('');
    setIsBroadcasting(false);
    alert('Alert broadcasted successfully across the network.');
  };

  const getPercentage = (votes: number): string => {
    return tally.total === 0 ? '0' : ((votes / tally.total) * 100).toFixed(1);
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold mb-4 border border-amber-200 dark:border-amber-800/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>{strings.secure_dashboard}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{strings.officer_control}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{strings.welcome_officer}</p>
          </div>
          <div>
            <button
              onClick={handleResetElection}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md flex items-center space-x-2 disabled:opacity-50"
              aria-label={strings.reset_election || 'Reset Election'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span aria-live="polite">{isResetting ? strings.resetting_btn : strings.reset_election}</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {strings.total_turnout}
            </h3>
            <div className="mt-2 text-4xl font-black text-gray-900 dark:text-white">{tally.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {strings.party_a_share}
            </h3>
            <div className="mt-2 text-4xl font-bold text-blue-600 dark:text-blue-500">
              {getPercentage(tally.partyA)}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {strings.party_b_share}
            </h3>
            <div className="mt-2 text-4xl font-bold text-emerald-500">{getPercentage(tally.partyB)}%</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {strings.party_c_share}
            </h3>
            <div className="mt-2 text-4xl font-bold text-amber-500">{getPercentage(tally.partyC)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Vote Tallies */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{strings.live_vote_tallies}</h2>
              <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded border border-green-200 dark:border-green-800/50">
                {strings.live}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {strings.party}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {strings.votes}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {strings.percentage}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Party A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tally.partyA}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getPercentage(tally.partyA)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1 block">{getPercentage(tally.partyA)}%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Party B
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tally.partyB}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getPercentage(tally.partyB)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1 block">{getPercentage(tally.partyB)}%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Party C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tally.partyC}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getPercentage(tally.partyC)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1 block">{getPercentage(tally.partyC)}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* System Control */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{strings.system_broadcast}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{strings.push_alerts}</p>

            <form onSubmit={handleBroadcast} className="flex-1 flex flex-col">
              <textarea
                value={broadcastMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setBroadcastMessage(e.target.value)}
                placeholder="Enter alert message (e.g., 'Voting extended by 1 hour')..."
                className="w-full flex-1 min-h-[150px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                required
              />
              <button
                type="submit"
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                aria-label={strings.send_alert}
              >
                {isBroadcasting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900"
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span aria-live="polite">{strings.broadcasting}</span>
                  </>
                ) : (
                  <span aria-live="polite">{strings.send_alert}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Live Voter Log */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{strings.live_voter_log}</h2>
            <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded border border-red-200 dark:border-red-800/50">
              {strings.admin_view}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {strings.voter_name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {strings.voter_id}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {strings.party_voted}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {strings.timestamp}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {castVotes?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {strings.no_votes}
                    </td>
                  </tr>
                ) : (
                  castVotes?.map((vote) => (
                    <tr key={vote.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {vote.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                        {vote.voterId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            vote.candidateId === 'partyA'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : vote.candidateId === 'partyB'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {vote.candidateId === 'partyA'
                            ? 'Party A'
                            : vote.candidateId === 'partyB'
                              ? 'Party B'
                              : vote.candidateId === 'partyC'
                                ? 'Party C'
                                : vote.candidateId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(vote.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
