import { CandidateID, VoterID, VisitorID, TransactionHash } from './types';

/**
 * Singularity Architecture: Type-Safe Branding Converters
 * Eliminates the need for 'as Type' assertions across the codebase.
 */

export function toCandidateID(id: string): CandidateID {
   
  return id as CandidateID;
}

export function toVoterID(id: string): VoterID {
   
  return id as VoterID;
}

export function toVisitorID(id: string): VisitorID {
   
  return id as VisitorID;
}

export function toTransactionHash(hash: string): TransactionHash {
   
  return hash as TransactionHash;
}
