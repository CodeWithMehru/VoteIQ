import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ipStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 30; // Max requests
const WINDOW_MS = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';
    const now = Date.now();
    const record = ipStore.get(ip);

    if (record) {
      if (now - record.timestamp < WINDOW_MS) {
        if (record.count >= RATE_LIMIT) {
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please wait a moment to prevent abuse.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
        record.count += 1;
      } else {
        ipStore.set(ip, { count: 1, timestamp: now });
      }
    } else {
      ipStore.set(ip, { count: 1, timestamp: now });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
