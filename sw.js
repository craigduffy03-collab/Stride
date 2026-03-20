const CACHE = 'stride-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for app shell
self.addEventListener('fetch', e => {
  // Don't intercept API calls
  if (e.request.url.includes('anthropic.com') ||
      e.request.url.includes('mediapipe') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('jsdelivr')) {
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res.status === 200) cache.put(e.request, res.clone());
          return res;
        });
        return cached || network;
      })
    )
  );
});
