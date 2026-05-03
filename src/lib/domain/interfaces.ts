import { Result, VotePayload, VoteTally, UserProfile } from './types';

export interface IVotingService {
  castVote(payload: VotePayload): Promise<Result<{ receipt: string; verificationHash: string }>>;
  getResults(): Promise<Result<VoteTally>>;
}

export interface ITranslationService {
  translate(text: string, targetLanguage: string): Promise<string>;
}

export interface IAuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  logout(): Promise<void>;
}
