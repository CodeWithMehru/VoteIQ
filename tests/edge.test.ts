/* eslint-disable */
import { describe, it, expect, vi } from 'vitest';
import { POST as VotePOST } from '@/app/api/vote/route';

// MOCK: Force Firestore transaction to detect duplicate ID
vi.mock('@/lib-admin', () => {
  return {
    adminDb: {
      collection: vi.fn().mockReturnThis(),
      doc: vi.fn().mockReturnThis(),
      runTransaction: vi.fn().mockImplementation(async (callback) => {
        const mockTransaction = {
          get: vi.fn().mockResolvedValue({ exists: true }), // SIMULATE EXISTING VOTE
          set: vi.fn(),
        };
        await callback(mockTransaction);
      }),
    },
  };
});

vi.mock('@/lib', () => ({ publishVoteCastEvent: vi.fn() }));
vi.mock('@/lib', () => ({ logVoteAnalytics: vi.fn() }));

describe('Edge Cases: Firestore Transactions', () => {
  it('throws 403 when voter ID already exists (Strict 1-Vote Lockout)', async () => {
    const req = new Request('http://localhost/api/vote', {
      method: 'POST',
      body: JSON.stringify({
        candidateId: 'partyA',
        visitorId: 'anon-123',
        voterId: 'DUPLICATE_ID_99',
        name: 'Hacker',
      }),
    });

    const res = await VotePOST(req);
    expect(res.status).toBe(403); // Security validation

    const data = await res.json();
    expect(data.error).toBe('ALREADY_VOTED');
  });
});
