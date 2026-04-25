import { NextResponse } from 'next/server';
const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
});

export async function POST(request: Request) {
  try {
    const { texts, targetLanguage } = await request.json();

    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return NextResponse.json({ error: 'texts (array) and targetLanguage are required' }, { status: 400 });
    }

    if (targetLanguage === 'en') {
      return NextResponse.json({ translations: texts });
    }

    const [translations] = await translate.translate(texts, targetLanguage);

    return NextResponse.json({ translations });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    // Graceful fallback to return the original text
    const { texts } = await request.json().catch(() => ({ texts: [] }));
    return NextResponse.json({ translations: texts || [] });
  }
}
