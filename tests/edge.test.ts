 
import { describe, it, expect, vi } from 'vitest';
import { POST as VotePOST } from '@/app/api/vote/route';
vi.mock('@/lib/ioc.server', () => ({
  SERVICE_KEYS: { VOTING: 'VotingService' },
  serverContainer: {
    resolve: vi.fn().mockImplementation(() => {
        return {
          castVote: vi.fn().mockResolvedValue({
            success: false,
            error: 'ALREADY_VOTED'
          })
        };
    })
  }
}));

vi.mock('@/lib/domain/logic', () => ({
  timingSafeEqual: vi.fn().mockReturnValue(true),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map([['x-csrf-token', 'mock-csrf-token-12345']])),
}));

describe('Edge Cases: Transactions', () => {
  it('throws 400 when voter ID already exists (Strict 1-Vote Lockout)', async () => {

    const req = new Request('http://localhost/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: 'partyA',
        visitorId: 'anon-123',
        voterId: 'DUPLICATE_ID_99',
        name: 'Hacker',
        csrfToken: 'mock-csrf-token-12345',
        nonce: 'unique-nonce-edge-test',
      }),
    });

    const res = await VotePOST(req);
    expect(res.status).toBe(400); // Route returns 400 with result.error for logical failures

    const data = await res.json();
    expect(data.error.code).toBe('VOTE_FAILED');
    expect(data.error.details).toBe('ALREADY_VOTED');
  });
});
