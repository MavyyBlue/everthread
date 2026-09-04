const CACHE = 'everthread-shell-v2';
const BASE = new URL('./', self.registration.scope).pathname;
const SHELL = [BASE, `${BASE}manifest.json`];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(
      cached =>
        cached ||
        fetch(event.request)
          .then(response => {
            // Cache successful same-origin assets as they are used so the
            // installed game remains available after the first online load.
            if (response.ok && new URL(event.request.url).origin === self.location.origin) {
              const clone = response.clone();
              caches.open(CACHE).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => caches.match(BASE)),
    ),
  );
});
