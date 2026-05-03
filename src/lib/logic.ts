/**
 * Zenith Architecture: Pure Logic & Controllers
 * Stateless utility functions for election simulation.
 */

import { VoterID } from './types';

/**
 * Validates a voter's identification string.
 * @param id The raw voter ID input.
 * @returns boolean indicating if the ID meets the minimum length and format requirements.
 */
export function validateVoterId(id: string): id is VoterID {
  // Mock validation logic: Alpha-numeric, 5-15 characters
  const regex = /^[a-zA-Z0-9-]{5,15}$/;
  return regex.test(id);
}

/**
 * Sanitizes user input to prevent XSS or injection.
 * @param input Raw string from user input.
 * @returns Sanitized string.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Node 2: Offensive Sanitization - Strip HTML tags and dangerous event handlers
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+=/gi, '') // Strip on* handlers (onerror, onload, etc)
    .replace(/script/gi, '') // Strip script keyword
    .replace(/[^a-zA-Z0-9 ]/g, '') // Strip non-alphanumeric (except spaces)
    .trim();
}

/**
 * Calculates turnout percentage based on registered vs actual voters.
 * @param actual Count of votes cast.
 * @param registered Count of registered voters.
 * @returns Formatted percentage string.
 */
export function calculateTurnout(actual: number, registered: number): string {
  if (registered === 0) return '0%';
  return `${((actual / registered) * 100).toFixed(1)}%`;
}

/**
 * Formats a cryptographic hash for display.
 * @param hash Full hash string.
 * @returns Truncated hash for UI safety.
 */
export function formatHash(hash: string): string {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

/**
 * Maps raw Firestore data to the internal Domain Model.
 * @param data Raw object from database.
 * @returns Sanitized and typed record.
 */
export function mapVoteRecord(data: any) {
  return {
    id: data.id || '',
    candidateId: data.candidateId || '',
    timestamp: data.timestamp || Date.now(),
    name: data.name || 'Anonymous',
    voterId: data.voterId || '',
  };
}
