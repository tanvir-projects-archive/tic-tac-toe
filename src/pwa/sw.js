const CACHE_NAME = 'tictactoe-v2';
const ASSETS = [
  '../../',
  '../../index.html',
  './manifest.json',
  '../style.css',
  '../script.js',
  '../img/favicon.png',
  '../img/icon.png'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clearing Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchedResponse = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith('http')) {
                cache.put(event.request, networkResponse.clone());
            }
        });
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchedResponse;
    })
  );
});
