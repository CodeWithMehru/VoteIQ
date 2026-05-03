import { cache } from 'react';
import { VoterID } from './types';

/**
 * Aegis Node 1: Timing Attack Mitigation
 * Pure JS implementation of timing-safe equality comparison.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates a voter's identification string.
 */
export function validateVoterId(id: string): id is VoterID {
  const regex = /^[a-zA-Z0-9-]{5,15}$/;
  return regex.test(id);
}

/**
 * Node 18: Functional Pipe Pattern
 * Provides a type-safe way to compose logic transformations.
 */
export const pipe = <T>(...fns: ReadonlyArray<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

/**
 * Sanitizes user input to prevent XSS or injection.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/script/gi, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
};

export const normalizeInput = (input: string): string => input.toLowerCase();

/**
 * Composite sanitization pipeline.
 */
export const cleanInput = pipe(sanitizeInput, normalizeInput);

/**
 * Calculates turnout percentage.
 */
export function calculateTurnout(actual: number, registered: number): string {
  if (registered === 0) return '0%';
  return `${((actual / registered) * 100).toFixed(1)}%`;
}

/**
 * Formats a cryptographic hash for display.
 */
export function formatHash(hash: string): string {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

/** Shape of a vote record returned by the data layer. */
export interface VoteRecordData {
  id: string;
  candidateId: string;
  timestamp: number;
  name: string;
  voterId: string;
}

/**
 * Singularity Node 8: React 19 / Next.js 15 cache() deduping.
 * Ensures domain mapping only occurs once per request cycle.
 */
export const mapVoteRecord = cache((data: VoteRecordData): VoteRecordData => {
  return {
    id: data.id || '',
    candidateId: data.candidateId || '',
    timestamp: data.timestamp || Date.now(),
    name: data.name || 'Anonymous',
    voterId: data.voterId || '',
  };
});
