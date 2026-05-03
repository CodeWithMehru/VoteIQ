import { z } from 'zod';

/**
 * Singularity Architecture: Zod Schemas for I/O Validation
 */

export const VoterIDSchema = z.string().min(1).brand<'VoterID'>();
export const CandidateIDSchema = z.string().min(1).brand<'CandidateID'>();
export const VisitorIDSchema = z.string().min(1).brand<'VisitorID'>();

export const VotePayloadSchema = z.object({
  candidateId: CandidateIDSchema,
  voterId: VoterIDSchema,
  visitorId: VisitorIDSchema,
  name: z.string().min(1),
  receipt: z.string().optional(), // Can be generated on server
  verificationHash: z.string().optional(), // Can be generated on server
  csrfToken: z.string().optional(),
}).readonly();

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
}).readonly();

export const TranslationRequestSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().length(2),
}).readonly();

export type ValidatedVotePayload = z.infer<typeof VotePayloadSchema>;
export type ValidatedChatRequest = z.infer<typeof ChatRequestSchema>;
export type ValidatedTranslationRequest = z.infer<typeof TranslationRequestSchema>;
