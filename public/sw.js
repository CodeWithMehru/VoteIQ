const CACHE_NAME = 'voteiq-v1';
const ASSETS_TO_CACHE = ['/', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return;
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
