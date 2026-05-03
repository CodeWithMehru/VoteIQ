import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Advanced Zenith Middleware
 * Implements Security Nodes 3, 7, 13, and 17.
 */

// Token Bucket Store
const bucketStore = new Map<string, { tokens: number; lastRefill: number }>();
const BUCKET_CAPACITY = 20;
const REFILL_RATE_MS = 2000; // 1 token per 2 seconds

function getTokens(ip: string) {
  const now = Date.now();
  let bucket = bucketStore.get(ip);

  if (!bucket) {
    bucket = { tokens: BUCKET_CAPACITY, lastRefill: now };
  } else {
    const refill = Math.floor((now - bucket.lastRefill) / REFILL_RATE_MS);
    bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  bucketStore.set(ip, bucket);
  return bucket.tokens;
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Security Node 3: Token Bucket Rate Limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const tokens = getTokens(ip);
    if (tokens <= 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Security Protocol: Rate limit exceeded (Token Bucket Empty)' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const bucket = bucketStore.get(ip)!;
    bucket.tokens -= 1;
    bucketStore.set(ip, bucket);

    // Security Node 2: HPP Prevention (Basic check)
    if (
      request.nextUrl.search.includes('[]') ||
      request.nextUrl.search.split('&').some((p) => p.split('=')[0].includes('__proto__'))
    ) {
      return new NextResponse(JSON.stringify({ error: 'Security Protocol: Parameter Pollution Detected' }), {
        status: 400,
      });
    }
  }

  // Security Node 7: Nonce-based CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security Node 13 & 17: Permissions Policy & Secure Headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
