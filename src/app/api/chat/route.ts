import { NextResponse } from 'next/server';
import { ChatRequestSchema, ValidationException, Result } from '@/lib';
import { getChatResponse } from '@/lib/infrastructure/gemini';

/**
 * Singularity Architecture: Defensive Chat API
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parseResult = ChatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationException('Invalid chat request', parseResult.error.format());
    }

    const { message } = parseResult.data;
    const reply: string = await getChatResponse(message);

    const res: NextResponse = NextResponse.json({ success: true, data: { reply } } satisfies Result<{ reply: string }>);
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    
    if (error instanceof ValidationException) {
      return NextResponse.json({ success: false, error: error.message, details: error.details }, { status: error.statusCode });
    }

    const errorMessage: string = error instanceof Error ? error.message : 'Failed to process chat request';
    const isQuotaError: boolean = errorMessage.includes('429') || errorMessage.includes('Quota');
    
    return NextResponse.json(
      { success: false, error: isQuotaError ? 'Google Cloud is currently syncing billing quota. Please wait.' : errorMessage },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
