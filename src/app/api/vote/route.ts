import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/infrastructure/firebase_admin_service';
import { publishVoteCastEvent } from '@/lib/infrastructure/pubsub';
import { logVoteAnalytics } from '@/lib/infrastructure/bigquery';
import { headers } from 'next/headers';
import { z } from 'zod';
import { Result, CandidateID, VisitorID, VoterID } from '@/lib/domain/types';

/**
 * Strict Input Schema for the Voting API.
 */
const VoteSchema = z.object({
  candidateId: z.string().min(1),
  visitorId: z.string().min(1),
  voterId: z.string().min(5).max(20),
  name: z.string().min(1),
  csrfToken: z.string().optional(),
});

/**
 * Domain-specific type for the voting response.
 */
type VoteResultData = {
  readonly receipt: string;
  readonly verificationHash: string;
};

/**
 * Voting API Route Handler (Purity Node 1, 5, 10)
 * @param request The incoming Request object.
 * @returns A Promise resolving to a NextResponse.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Node 10: Zod Data Mapping & Validation
    const parseResult = VoteSchema.safeParse(body);
    if (!parseResult.success) {
      return createErrorResponse('INVALID_PAYLOAD', 400, parseResult.error);
    }

    const { candidateId, visitorId, voterId, name, csrfToken } = parseResult.data;

    // Node 13: Security Protocol Verification
    const headersList = await headers();
    const providedCsrfToken = headersList.get('x-csrf-token') || csrfToken;
    if (!providedCsrfToken || providedCsrfToken !== 'mock-csrf-token-12345') {
      return createErrorResponse('FORBIDDEN_CSRF', 403);
    }

    const timestamp = Date.now();

    // Estonian Double Envelope Simulation (Logic extraction candidate)
    const innerEnvelopeEncrypted = Buffer.from(`vote:${candidateId}:${timestamp}`).toString('base64');
    const verificationHash = Buffer.from(`verify:${visitorId}:${innerEnvelopeEncrypted}`)
      .toString('hex')
      .substring(0, 16)
      .toUpperCase();

    if (!adminDb) {
      await Promise.all([
        publishVoteCastEvent(visitorId as VisitorID, candidateId as CandidateID),
        logVoteAnalytics(visitorId as VisitorID)
      ]);

      return createSuccessResponse({
        receipt: `MOCK-${verificationHash}`,
        verificationHash,
      });
    }

    const castVoteRef = adminDb.collection('cast_votes').doc(voterId);
    const tallyRef = adminDb.collection('vote_tallies').doc(candidateId);

    await adminDb.runTransaction(async (transaction) => {
      const castVoteDoc = await transaction.get(castVoteRef);
      if (castVoteDoc.exists) {
        throw new Error('ALREADY_VOTED');
      }

      const tallyDoc = await transaction.get(tallyRef);
      transaction.set(castVoteRef, {
        voterId,
        name,
        candidateId,
        timestamp,
        verificationHash,
      });

      const newCount = tallyDoc.exists ? (tallyDoc.data()?.count || 0) + 1 : 1;
      transaction.set(tallyRef, { count: newCount }, { merge: true });
    });

    await Promise.all([
      publishVoteCastEvent(visitorId as VisitorID, candidateId as CandidateID),
      logVoteAnalytics(visitorId as VisitorID)
    ]);

    return createSuccessResponse({
      receipt: `TXN-${verificationHash}`,
      verificationHash,
    });

  } catch (error: unknown) {
    console.error('[Zenith Security] API Breach/Error:', error);
    const err = error as { message?: string; code?: string };

    if (err?.message === 'ALREADY_VOTED') {
      return createErrorResponse('ALREADY_VOTED', 403, 'Duplicate ballot detected.');
    }

    return createErrorResponse('INTERNAL_SERVER_ERROR', 500, err.message);
  }
}

/**
 * Standardized Success Factory
 */
function createSuccessResponse(data: VoteResultData): NextResponse {
  const result: Result<VoteResultData> = { success: true, data };
  return NextResponse.json(result);
}

/**
 * Standardized Error Factory
 */
function createErrorResponse(error: string, status: number, details?: any): NextResponse {
  const result: Result<never, { code: string; details?: any }> = { 
    success: false, 
    error: { code: error, details } 
  };
  return NextResponse.json(result, { status });
}
