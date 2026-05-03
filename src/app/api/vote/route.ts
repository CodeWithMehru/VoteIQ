import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Result, VotePayloadSchema, IVotingService, ValidationException } from '@/lib';
import { serverContainer, SERVICE_KEYS } from '@/lib/ioc.server';
import { timingSafeEqual } from '@/lib/domain/logic';

const usedNonces: Set<string> = new Set<string>();
let consecutiveFailures: number = 0;
const FAILURE_THRESHOLD: number = 3;

interface RawBody {
  readonly nonce?: string;
  readonly csrfToken?: string;
  readonly honeypot?: boolean;
}

async function runAegisSecurityChecks(rawBody: RawBody): Promise<NextResponse | null> {
  // Aegis: Replay Attack Prevention
  const nonce: string = rawBody.nonce || '';
  if (!nonce || usedNonces.has(nonce)) {
    return createErrorResponse('REPLAY_ATTACK_DETECTED', 403);
  }
  usedNonces.add(nonce);
  setTimeout((): boolean => usedNonces.delete(nonce), 60000);

  // Aegis: CSRF Protection
  const headersList = await headers();
  const providedCsrfToken: string | null = headersList.get('x-csrf-token') || rawBody.csrfToken || null;
  
  if (!providedCsrfToken || !timingSafeEqual(providedCsrfToken, 'mock-csrf-token-12345')) {
    return createErrorResponse('FORBIDDEN_CSRF', 403);
  }
  return null;
}

/**
 * Singularity Architecture: Defensive API Route with Hard IoC Boundary
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    return createErrorResponse('SYSTEM_LOCKDOWN', 503, 'Aegis Security: Backend in fail-closed state.');
  }

  try {
    const contentType: string | null = request.headers.get('content-type');
    if (contentType !== 'application/json') {
      return createErrorResponse('UNSUPPORTED_MEDIA_TYPE', 415);
    }

    const body: unknown = await request.json();
    const rawBody = body as RawBody;

    // Honeypot check
    if (rawBody.honeypot) {
       return createSuccessResponse({ receipt: 'MOCK-OK', verificationHash: 'OK' });
    }

    const parseResult = VotePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationException('Invalid vote payload', parseResult.error.format());
    }

    const payload = parseResult.data;

    const securityFailure = await runAegisSecurityChecks(rawBody);
    if (securityFailure) return securityFailure;

    // Node 2: Server-Side IoC Container Resolution
    const votingService: IVotingService = serverContainer.resolve<IVotingService>(SERVICE_KEYS.VOTING);
    
    // Node 3: WASM Hashing integrated via VotingService
    const result = await votingService.castVote(payload);

    if (!result.success) {
      return createErrorResponse('VOTE_FAILED', 400, result.error);
    }

    consecutiveFailures = 0;
    return createSuccessResponse(result.data);

  } catch (error: unknown) {
    console.error('Vote API Error details:', error);
    consecutiveFailures++;
    if (error instanceof ValidationException) {
      return createErrorResponse(error.code, error.statusCode, error.details);
    }
    return createErrorResponse('INTERNAL_SECURITY_ERROR', 500);
  }
}

function createSuccessResponse(data: unknown): NextResponse {
  const res: Result<unknown> = { success: true, data };
  return NextResponse.json(res);
}

function createErrorResponse(error: string, status: number, details?: unknown): NextResponse {
  const res: Result<never, { code: string; details?: unknown }> = { 
    success: false, 
    error: { code: error, details } 
  };
  return NextResponse.json(res, { status });
}
