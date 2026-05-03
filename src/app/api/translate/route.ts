import { NextResponse } from 'next/server';
import { z } from 'zod';
const { Translate } = require('@google-cloud/translate').v2;

const TranslateSchema = z.object({
  texts: z.array(z.string().min(1)).min(1).max(50),
  targetLanguage: z.string().length(2),
});

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = TranslateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid payload schema', details: parseResult.error }, { status: 400 });
    }

    const { texts, targetLanguage } = parseResult.data;

    if (targetLanguage === 'en') {
      return NextResponse.json({ translations: texts });
    }

    const response = await translate.translate(texts, targetLanguage);
    const translations = response[0];

    const res = NextResponse.json({ translations });
    res.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    return res;
  } catch (error: unknown) {
    console.error('Translate API Error:', error);
    // Graceful fallback to return the original text
    const { texts } = await request.json().catch(() => ({ texts: [] }));
    return NextResponse.json({ translations: texts || [] });
  }
}
