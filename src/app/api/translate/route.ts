import { NextResponse } from 'next/server';
import { TranslationRequestSchema, ValidationException, Result } from '@/lib';
import { translateText } from '@/lib/infrastructure/translate';

/**
 * Singularity Architecture: Defensive Translation API
 */
export async function POST(request: Request): Promise<NextResponse> {
  let originalText: string = '';
  try {
    const body: unknown = await request.json();
    const parseResult = TranslationRequestSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationException('Invalid translation request', parseResult.error.format());
    }

    const { text, targetLanguage } = parseResult.data;
    originalText = text;

    if (targetLanguage === 'en') {
      return NextResponse.json({ success: true, data: { translation: text } } satisfies Result<{ translation: string }>);
    }

    const translation: string = await translateText(text, targetLanguage);

    const res: NextResponse = NextResponse.json({ success: true, data: { translation } } satisfies Result<{ translation: string }>);
    res.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    return res;
  } catch (error: unknown) {
    console.error('Translate API Error:', error);

    if (error instanceof ValidationException) {
      return NextResponse.json({ success: false, error: error.message, details: error.details }, { status: error.statusCode });
    }

    // Graceful fallback to return the original text
    return NextResponse.json({ success: true, data: { translation: originalText || '' } } satisfies Result<{ translation: string }>);
  }
}
