 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as ChatPOST } from '@/app/api/chat/route';
import { POST as VotePOST } from '@/app/api/vote/route';
import { POST as TranslatePOST } from '@/app/api/translate/route';
import { z } from 'zod';

import * as geminiLib from '@/lib/infrastructure/gemini';

vi.mock('@/lib/infrastructure/gemini', () => ({ 
  getChatResponse: vi.fn(),
}));
vi.mock('@/lib/ioc.server', () => ({
  SERVICE_KEYS: { VOTING: 'VotingService' },
  serverContainer: {
    resolve: vi.fn().mockImplementation(() => {
      return {
        castVote: vi.fn().mockResolvedValue({
          success: true,
          data: { receipt: 'MOCK-RECEIPT', verificationHash: 'MOCK-HASH' }
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


const mockTranslate = vi.fn().mockResolvedValue([['Hola']]);
vi.mock('@google-cloud/translate', () => ({
  v2: {
    Translate: vi.fn().mockImplementation(() => ({
      translate: mockTranslate,
    })),
  },
}));

const ChatResponseSchema = z.object({
  data: z.object({
    reply: z.string().optional(),
  }).optional(),
});

const VoteResponseSchema = z.object({
  success: z.boolean().optional(),
});

const TranslateResponseSchema = z.object({
  data: z.object({
    translation: z.string().optional(),
  }).optional(),
});

describe('API Routes & Google Cloud Integration', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  describe('/api/chat', () => {
    it('returns 400 if message is missing', async (): Promise<void> => {
      const req = new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({}) });
      const res = await ChatPOST(req);
      expect(res.status).toBe(400);
    });

    it('returns a valid response from Gemini', async (): Promise<void> => {
      vi.mocked(geminiLib.getChatResponse).mockResolvedValueOnce('This is a mock Gemini response');
      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const res = await ChatPOST(req);
      const data = ChatResponseSchema.parse(await res.json());

      expect(geminiLib.getChatResponse).toHaveBeenCalledWith('Hello');
      expect(data.data?.reply).toBe('This is a mock Gemini response');
    });

    it('returns a fallback on API error', async (): Promise<void> => {
      vi.mocked(geminiLib.getChatResponse).mockRejectedValueOnce(new Error('API failed'));
      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const res = await ChatPOST(req);
      expect(res.status).toBe(500);
    });
  });

  describe('/api/vote', () => {
    it('returns 400 if fields are missing', async (): Promise<void> => {
      const req = new Request('http://localhost/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: 'A' }),
      });
      const res = await VotePOST(req);
      expect(res.status).toBe(400);
    });

    it('processes vote in mock mode', async (): Promise<void> => {
      const req = new Request('http://localhost/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: 'partyA',
          visitorId: 'user-1',
          voterId: 'ABC12345',
          name: 'John',
          csrfToken: 'mock-csrf-token-12345',
          nonce: 'unique-nonce-api-test',
        }),
      });
      const res = await VotePOST(req);
      const data = VoteResponseSchema.parse(await res.json());

      expect(data.success).toBe(true);
    });
  });

  describe('/api/translate', () => {
    it('returns 400 if fields are missing', async (): Promise<void> => {
      const req = new Request('http://localhost/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Hello'] }),
      });
      const res = await TranslatePOST(req);
      expect(res.status).toBe(400);
    });

    it('returns original text if targetLanguage is en', async (): Promise<void> => {
      const req = new Request('http://localhost/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text: 'Hello', targetLanguage: 'en' }),
      });
      const res = await TranslatePOST(req);
      const data = TranslateResponseSchema.parse(await res.json());

      expect(data.data?.translation).toBe('Hello');
    });
  });
});
