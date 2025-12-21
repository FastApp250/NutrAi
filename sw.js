
const CACHE_NAME = 'nitrai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip cross-origin requests that aren't GET or are from chrome extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(networkResponse => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache external resources (ESM, Tailwind) and local assets
        const url = new URL(event.request.url);
        const shouldCache = 
            url.origin === location.origin || 
            url.hostname === 'esm.sh' || 
            url.hostname === 'cdn.tailwindcss.com';

        if (shouldCache) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
        }

        return networkResponse;
      });
    })
  );
});
