/**
 * Zenith Architecture: Branded Types & Core Interfaces
 * Prevents accidental ID cross-contamination.
 */

/**
 * Brand helper for nominal typing.
 */
export type Brand<K, T> = K & { readonly __brand: T };

/**
 * Branded ID types to ensure compile-time isolation.
 */
export type VoterID = Brand<string, 'VoterID'>;
export type CandidateID = Brand<string, 'CandidateID'>;
export type VisitorID = Brand<string, 'VisitorID'>;
export type TransactionHash = Brand<string, 'TransactionHash'>;

/**
 * Standardized Result pattern for exhaustive error handling.
 */
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Core Domain Entity: VotingCandidate
 */
export interface VotingCandidate {
  readonly id: CandidateID;
  readonly name: string;
  readonly party: string;
  readonly color: string;
  readonly shape: string;
}

/**
 * Core Domain Entity: VotePayload
 */
export interface VotePayload {
  readonly candidateId: CandidateID;
  readonly voterId: VoterID;
  readonly visitorId: VisitorID;
  readonly name: string;
  readonly receipt: string;
  readonly verificationHash: string;
  readonly csrfToken?: string;
}

/**
 * Core Domain Entity: VoteTally
 */
export interface VoteTally {
  readonly partyA: number;
  readonly partyB: number;
  readonly partyC: number;
  readonly total: number;
}

/**
 * Dependency Inversion: Voting Service Interface
 */
export interface IVotingService {
  /**
   * Casts a ballot with cryptographic integrity verification.
   * @param payload The vote payload containing voter and candidate IDs.
   * @returns A Result object containing either the receipt data or an error.
   */
  castVote(payload: VotePayload): Promise<Result<{ receipt: string; verificationHash: string }>>;
  
  /**
   * Retrieves the latest election results.
   * @returns A Result object containing the vote tally.
   */
  getResults(): Promise<Result<VoteTally>>;
}
