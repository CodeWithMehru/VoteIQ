import { NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/infrastructure/gemini';
import { z } from 'zod';

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = ChatSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload schema', details: parseResult.error }, { status: 400 });
    }

    const { message } = parseResult.data;

    const reply = await getChatResponse(message);

    const res = NextResponse.json({ reply });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const err = error as { status?: number; message?: string };
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota')) {
      return NextResponse.json(
        { error: 'Google Cloud is currently syncing billing quota. Please wait.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: err?.message || 'Failed to process chat request' }, { status: 500 });
  }
}
