import { NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const reply = await getChatResponse(message);
    
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota')) {
      return NextResponse.json(
        { error: 'Google Cloud is currently syncing billing quota. Please wait.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
