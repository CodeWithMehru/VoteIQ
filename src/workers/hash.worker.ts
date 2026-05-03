/**
 * Singularity Node 2: Web Worker for Hashing
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = (self as any);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ctx.onmessage = async (e: MessageEvent<any>): Promise<void> => {
  const { data } = e;
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hashBuffer: ArrayBuffer = await (crypto as any).subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    
    const fullHash = `VVPAT-${hashHex.substring(0, 16)}-${Date.now()}`;
    
    ctx.postMessage({ hash: hashHex, fullHash });
  } catch (_error: unknown) {
    ctx.postMessage({ error: 'HASH_WORKER_FAILURE' });
  }
};

export {};
