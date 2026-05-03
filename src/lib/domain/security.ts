import { z } from 'zod';

/**
 * Argon2 Mock Layer (Security Node 5)
 * Simulates military-grade hashing for mock data rest states.
 * @param data The string to hash.
 * @returns A hex-encoded SHA-512 hash string.
 */
export async function mockArgon2Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + 'ZENITH_SALT');
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Zod Sanitizer (Security Node 9)
 * Strictly strips unknown properties from incoming payloads.
 * @param schema The Zod schema to validate against.
 * @param data The raw data object.
 * @returns The parsed and validated data object of type T.
 */
export function sanitizePayload<T>(schema: z.ZodSchema<T>, data: any): T {
  return schema.parse(data);
}

/**
 * Fetch SWR Engine (Efficiency Node 4)
 * Implements stale-while-revalidate for local fetch calls.
 */
const fetchCache = new Map<string, { readonly data: any; readonly timestamp: number }>();
const SWR_TTL = 60000; // 1 minute

/**
 * Executes a fetch request with Stale-While-Revalidate caching logic.
 * @param url The target endpoint URL.
 * @param options Standard RequestInit options.
 * @returns A promise resolving to the JSON-parsed response of type T.
 */
export async function swrFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const cached = fetchCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < SWR_TTL) {
    // Revalidate in background
    fetch(url, options).then(res => res.json()).then(data => {
      fetchCache.set(cacheKey, { data, timestamp: now });
    }).catch(() => {});
    return cached.data as T;
  }

  const res = await fetch(url, options);
  const data = await res.json();
  fetchCache.set(cacheKey, { data, timestamp: now });
  return data as T;
}
