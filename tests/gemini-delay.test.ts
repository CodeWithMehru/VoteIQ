import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';

describe('Gemini Network Delay', () => {
  it('handles simulated network timeouts gracefully', async () => {
    vi.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    response: { text: () => 'Delayed Response' },
                  }),
                5000
              )
            ),
        }),
      })),
    }));

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const startTime = Date.now();
    const res = await POST(req);
    const data = await res.json();

    expect(Date.now() - startTime).toBeGreaterThanOrEqual(4900);
    expect(data.reply).toBe('Delayed Response');
  });
});
