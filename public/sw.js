const CACHE = 'everthread-shell-v9';
const BASE = new URL('./', self.registration.scope).pathname;
const SHELL = [
  BASE,
  `${BASE}manifest.json`,
  `${BASE}icons/everthread-icon-192.png`,
  `${BASE}icons/everthread-icon-512.png`,
  `${BASE}icons/cash.png`,
];

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

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) caches.open(CACHE).then(cache => cache.put(BASE, response.clone()));
          return response;
        })
        .catch(() => caches.match(BASE)),
    );
    return;
  }

  const requestUrl = new URL(event.request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;
  const codeRequest = sameOrigin && (event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'worker');

  if (codeRequest) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
        .then(response => response || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && sameOrigin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        return response;
      });
    }),
  );
});
