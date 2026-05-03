 
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';

describe('Gemini Network Delay', () => {
  it('handles simulated network timeouts gracefully', async (): Promise<void> => {
    process.env.GEMINI_API_KEY = 'mock_key';

    vi.mock('@/lib/infrastructure/gemini', () => ({
      getChatResponse: vi.fn().mockImplementation(() => 
        new Promise<string>((resolve) => 
          setTimeout(() => resolve('Delayed Response'), 4000)
        )
      )
    }));

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const startTime: number = Date.now();
    const res = await POST(req);
    const data: unknown = await res.json();

    expect(Date.now() - startTime).toBeGreaterThanOrEqual(3900);
    expect((data as { data?: { reply?: string } }).data?.reply).toBe('Delayed Response');
  });
});
