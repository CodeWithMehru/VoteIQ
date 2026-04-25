import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as ChatPOST } from '@/app/api/chat/route';
import { POST as VotePOST } from '@/app/api/vote/route';
import { POST as TranslatePOST } from '@/app/api/translate/route';

import * as geminiLib from '@/lib/gemini';
import * as pubsubLib from '@/lib/pubsub';
import * as bigqueryLib from '@/lib/bigquery';
import * as translateLib from '@/lib/translate';

vi.mock('@/lib/gemini', () => ({ getChatResponse: vi.fn() }));
vi.mock('@/lib/firebase-admin', () => ({ adminDb: null })); // Forces offline/mock mode in vote route
vi.mock('@/lib/pubsub', () => ({ publishVoteCastEvent: vi.fn() }));
vi.mock('@/lib/bigquery', () => ({ logVoteAnalytics: vi.fn() }));
vi.mock('@/lib/translate', () => ({ translateText: vi.fn() }));

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
      (geminiLib.getChatResponse as any).mockResolvedValueOnce('This is a mock Gemini response');
      const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({ message: 'Hello' }) });
      const res = await ChatPOST(req);
      const data = await res.json();
      
      expect(geminiLib.getChatResponse).toHaveBeenCalledWith('Hello');
      expect(data.reply).toBe('This is a mock Gemini response');
    });

    it('returns a fallback on API error', async () => {
      (geminiLib.getChatResponse as any).mockRejectedValueOnce(new Error('API failed'));
      const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({ message: 'Hello' }) });
      const res = await ChatPOST(req);
      expect(res.status).toBe(500);
    });
  });

  describe('/api/vote', () => {
    it('returns 400 if fields are missing', async () => {
      const req = new Request('http://localhost/api/vote', { method: 'POST', body: JSON.stringify({ candidateId: 'A' }) });
      const res = await VotePOST(req);
      expect(res.status).toBe(400);
    });

    it('processes vote in mock mode and calls Pub/Sub and BigQuery', async () => {
      const req = new Request('http://localhost/api/vote', { 
        method: 'POST', 
        body: JSON.stringify({ candidateId: 'partyA', visitorId: 'user-1' }) 
      });
      const res = await VotePOST(req);
      const data = await res.json();
      
      expect(data.success).toBe(true);
      expect(data.receipt).toContain('MOCK-');
      
      // Verify Google Cloud mocked services were called
      expect(pubsubLib.publishVoteCastEvent).toHaveBeenCalledWith('user-1', 'partyA');
      expect(bigqueryLib.logVoteAnalytics).toHaveBeenCalledWith('user-1');
    });
  });

  describe('/api/translate', () => {
    it('returns 400 if fields are missing', async () => {
      const req = new Request('http://localhost/api/translate', { method: 'POST', body: JSON.stringify({ text: 'Hello' }) });
      const res = await TranslatePOST(req);
      expect(res.status).toBe(400);
    });

    it('returns translated text', async () => {
      (translateLib.translateText as any).mockResolvedValueOnce('Hola');
      const req = new Request('http://localhost/api/translate', { 
        method: 'POST', 
        body: JSON.stringify({ text: 'Hello', targetLanguage: 'es' }) 
      });
      const res = await TranslatePOST(req);
      const data = await res.json();
      
      expect(translateLib.translateText).toHaveBeenCalledWith('Hello', 'es');
      expect(data.translatedText).toBe('Hola');
    });
  });
});
