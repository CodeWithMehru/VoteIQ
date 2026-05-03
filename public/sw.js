/**
 * Singularity Node 9: Service Worker Navigation Preload
 */

self.addEventListener('activate', (event) => {
  event.waitUntil(async function() {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
  }());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(async function() {
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }
      return fetch(event.request);
    }());
  }
});
