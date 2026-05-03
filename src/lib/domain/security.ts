import { z } from 'zod';

/**
 * Argon2 Mock Layer (Security Node 5)
 * Simulates military-grade hashing for mock data rest states.
 */
export async function mockArgon2Hash(data: string): Promise<string> {
  const encoder: TextEncoder = new TextEncoder();
  const dataBuffer: Uint8Array = encoder.encode(data + 'ZENITH_SALT');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hashBuffer: ArrayBuffer = await (globalThis.crypto as any).subtle.digest('SHA-512', dataBuffer);
  const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Zod Sanitizer (Security Node 9)
 * Strictly strips unknown properties from incoming payloads.
 */
export function sanitizePayload<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/** Shape of a cache entry in the SWR store. */
interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
}

/**
 * Fetch SWR Engine (Efficiency Node 4)
 * Implements stale-while-revalidate for local fetch calls.
 */
const fetchCache = new Map<string, CacheEntry<unknown>>();
const SWR_TTL = 60000; // 1 minute

/**
 * Executes a fetch request with Stale-While-Revalidate caching logic.
 */
export async function swrFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
   
  const cached = fetchCache.get(cacheKey) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (cached && now - cached.timestamp < SWR_TTL) {
    // Revalidate in background
    void fetch(url, options)
      .then((res: Response) => res.json())
      .then((data: unknown) => {
        fetchCache.set(cacheKey, { data, timestamp: now });
      })
      .catch(() => undefined);
    return cached.data;
  }

  const res: Response = await fetch(url, options);
  const data: T = await res.json();
  fetchCache.set(cacheKey, { data, timestamp: now });
  return data;
}
