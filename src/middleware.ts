import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Aegis-Tier Security Middleware
 * Implements Security Nodes 5, 13, 14.
 */

const bucketStore = new Map<string, { tokens: number; lastRefill: number }>();
const BUCKET_CAPACITY = 20;
const REFILL_RATE_MS = 2000;

/** Returns the current token count for an IP, refilling as needed. */
function getTokens(ip: string): number {
  const now: number = Date.now();
  let bucket = bucketStore.get(ip);
  if (!bucket) {
    bucket = { tokens: BUCKET_CAPACITY, lastRefill: now };
  } else {
    const refill: number = Math.floor((now - bucket.lastRefill) / REFILL_RATE_MS);
    bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  bucketStore.set(ip, bucket);
  return bucket.tokens;
}

/** Returns a 413 response if the payload exceeds the 10KB cap. */
function checkPayloadSize(request: NextRequest): NextResponse | null {
  const contentLength: number = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 10 * 1024) {
    return new NextResponse(
      JSON.stringify({ error: 'Payload size exceeds Aegis security threshold (10KB)' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}

/** Returns a 403 response if a path traversal pattern is detected. */
function checkTraversalAttack(request: NextRequest): NextResponse | null {
  const traversalPattern = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i;
  const { pathname } = request.nextUrl;
  if (traversalPattern.test(pathname) || traversalPattern.test(request.nextUrl.search)) {
    return new NextResponse(
      JSON.stringify({ error: 'Security Protocol: Malicious Path Pattern Detected' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}

/** Returns a 403 if request originates outside of designated mock voting regions. */
function checkGeoFence(request: NextRequest): NextResponse | null {
  const country: string = request.headers.get('x-appengine-country') || 'US';
  if (country !== 'US' && country !== 'IN') {
    return new NextResponse(
      JSON.stringify({ error: 'Aegis Geo-Fence: Request originated from unauthorized region' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}

/** Returns a 429 if the IP has exhausted its token bucket. */
function checkRateLimit(ip: string): NextResponse | null {
  const tokens: number = getTokens(ip);
  if (tokens <= 0) {
    return new NextResponse(
      JSON.stringify({ error: 'Security Protocol: Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const bucket = bucketStore.get(ip);
  if (bucket) bucket.tokens -= 1;
  return null;
}

export function middleware(request: NextRequest): NextResponse {
  const ip: string = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { pathname } = request.nextUrl;

  const payloadError: NextResponse | null = checkPayloadSize(request);
  if (payloadError) return payloadError;

  const traversalError: NextResponse | null = checkTraversalAttack(request);
  if (traversalError) return traversalError;

  if (pathname.startsWith('/api/')) {
    const geoError: NextResponse | null = checkGeoFence(request);
    if (geoError) return geoError;

    const rateError: NextResponse | null = checkRateLimit(ip);
    if (rateError) return rateError;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
