import { z } from 'zod';

export type Brand<K, T extends string | number | symbol> = K & z.BRAND<T>;

export type VoterID = string & z.BRAND<'VoterID'>;
export type CandidateID = string & z.BRAND<'CandidateID'>;
export type VisitorID = string & z.BRAND<'VisitorID'>;
export type TransactionHash = string & z.BRAND<'TransactionHash'>;

export type Result<T, E = string> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export interface VotingCandidate {
  readonly id: CandidateID;
  readonly name: string;
  readonly symbol?: string;
  readonly party?: string;
  readonly color?: string;
  readonly shape?: string;
}

export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp?: number;
}

export interface UserProfile {
  readonly uid: string;
  readonly email?: string;
  readonly name?: string;
  readonly role?: 'staff' | 'citizen';
}

export interface VotePayload {
  readonly candidateId: CandidateID;
  readonly voterId: VoterID;
  readonly visitorId: VisitorID;
  readonly name: string;
  readonly receipt?: string;
  readonly verificationHash?: string;
  readonly csrfToken?: string;
}

export interface VoteTally {
  readonly partyA: number;
  readonly partyB: number;
  readonly partyC: number;
  readonly total: number;
}
