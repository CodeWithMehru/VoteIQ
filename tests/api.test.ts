import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST as ChatPOST } from '@/app/api/chat/route';
import { POST as VotePOST } from '@/app/api/vote/route';
import { POST as TranslatePOST } from '@/app/api/translate/route';

import * as geminiLib from '@/lib/infrastructure/gemini';
import * as pubsubLib from '@/lib/infrastructure/pubsub';
import * as bigqueryLib from '@/lib/infrastructure/bigquery';

vi.mock('@/lib/infrastructure/gemini', () => ({ getChatResponse: vi.fn() }));
vi.mock('@/lib/infrastructure/firebase_admin_service', () => ({ adminDb: null }));
vi.mock('@/lib/infrastructure/pubsub', () => ({ publishVoteCastEvent: vi.fn() }));
vi.mock('@/lib/infrastructure/bigquery', () => ({ logVoteAnalytics: vi.fn() }));

const mockTranslate = vi.fn().mockResolvedValue([['Hola']]);
vi.mock('@google-cloud/translate', () => ({
  v2: {
    Translate: vi.fn().mockImplementation(() => ({
      translate: mockTranslate,
    })),
  },
}));

describe('API Routes & Google Cloud Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('/api/chat', () => {
    it('returns 400 if message is missing', async () => {
      const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({}) });
      const res = await ChatPOST(req);
      expect(res.status).toBe(400);
    });

    it('returns a valid response from Gemini', async () => {
      (geminiLib.getChatResponse as Mock).mockResolvedValueOnce('This is a mock Gemini response');
      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const res = await ChatPOST(req);
      const data = await res.json();

      expect(geminiLib.getChatResponse).toHaveBeenCalledWith('Hello');
      expect(data.reply).toBe('This is a mock Gemini response');
    });

    it('returns a fallback on API error', async () => {
      (geminiLib.getChatResponse as Mock).mockRejectedValueOnce(new Error('API failed'));
      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const res = await ChatPOST(req);
      expect(res.status).toBe(500);
    });
  });

  describe('/api/vote', () => {
    it('returns 400 if fields are missing', async () => {
      const req = new Request('http://localhost/api/vote', {
        method: 'POST',
        body: JSON.stringify({ candidateId: 'A' }),
      });
      const res = await VotePOST(req);
      expect(res.status).toBe(400);
    });

    it('processes vote in mock mode and calls Pub/Sub and BigQuery', async () => {
      const req = new Request('http://localhost/api/vote', {
        method: 'POST',
        body: JSON.stringify({ 
          candidateId: 'partyA', 
          visitorId: 'user-1', 
          voterId: 'ABC12345', 
          name: 'John',
          csrfToken: 'mock-csrf-token-12345'
        }),
      });
      const res = await VotePOST(req);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.receipt).toContain('MOCK-');

      // Verify Google Cloud mocked services were called
      expect(pubsubLib.publishVoteCastEvent).toHaveBeenCalledWith('user-1', 'partyA');
      expect(bigqueryLib.logVoteAnalytics).toHaveBeenCalledWith('user-1');
    });
  });

  describe('/api/translate', () => {
    it('returns 400 if fields are missing', async () => {
      const req = new Request('http://localhost/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Hello'] }),
      });
      const res = await TranslatePOST(req);
      expect(res.status).toBe(400);
    });

    it('returns original texts if targetLanguage is en', async () => {
      const req = new Request('http://localhost/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Hello'], targetLanguage: 'en' }),
      });
      const res = await TranslatePOST(req);
      const data = await res.json();

      expect(data.translations).toEqual(['Hello']);
    });
  });
});
