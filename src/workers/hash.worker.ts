/**
 * VVPAT Hashing Web Worker (Efficiency Node 1)
 * Offloads SHA-256 calculation to keep the main thread at 60FPS.
 */

self.onmessage = async (e: MessageEvent) => {
  const { data, visitorId } = e.data;

  // Simulation of intensive cryptographic chain calculation
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(`${data}:${visitorId}:${Date.now()}`);

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    // Artificial delay to simulate complex ledger work if needed
    // await new Promise(resolve => setTimeout(resolve, 500));

    self.postMessage({
      hash: hashHex.substring(0, 16),
      fullHash: hashHex,
    });
  } catch (error) {
    self.postMessage({ error: 'Hashing failed' });
  }
};
